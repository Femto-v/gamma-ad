<script setup>
import {
    ref,
    computed,
    onMounted,
    watch,
    nextTick,
    onBeforeUnmount,
} from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

const nama = ref("");
const tahun = ref("");
const kursus = ref("");
const students = ref([]);
const isLoading = ref(false);
const sessionId = ref("");
const sliderRef = ref(null);
const currentIndex = ref(0);

const CARD_WIDTH = 220;
const CARD_GAP = 16; // px, matches gap-4
const isOverflowing = ref(false);

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Filtering logic (live, instant)
const filteredStudents = computed(() => {
    let filtered = students.value;
    if (nama.value.trim()) {
        filtered = filtered.filter((s) =>
            s.name?.toLowerCase().includes(nama.value.trim().toLowerCase())
        );
    }
    if (tahun.value.trim()) {
        filtered = filtered.filter((s) =>
            s.yearCourse?.split("/")[0]?.trim().includes(tahun.value.trim())
        );
    }
    if (kursus.value.trim()) {
        filtered = filtered.filter((s) =>
            s.yearCourse
                ?.split("/")[1]
                ?.trim()
                .toLowerCase()
                .includes(kursus.value.trim().toLowerCase())
        );
    }
    return filtered;
});

function updateOverflow() {
    nextTick(() => {
        const scroller = sliderRef.value;
        if (!scroller) return;
        const cardsWidth =
            filteredStudents.value.length * CARD_WIDTH +
            (filteredStudents.value.length - 1) * CARD_GAP;
        isOverflowing.value = cardsWidth > scroller.offsetWidth;
    });
}

function scrollToCard(idx) {
    const scroller = sliderRef.value;
    if (scroller && scroller.children[idx]) {
        const card = scroller.children[idx];
        const center =
            card.offsetLeft - scroller.offsetWidth / 2 + card.offsetWidth / 2;
        scroller.scrollTo({
            left: center,
            behavior: "smooth",
        });
        currentIndex.value = idx;
    }
}
function nextCard() {
    if (currentIndex.value < filteredStudents.value.length - 1) {
        scrollToCard(currentIndex.value + 1);
    }
}
function prevCard() {
    if (currentIndex.value > 0) {
        scrollToCard(currentIndex.value - 1);
    }
}

// Arrow keys navigation (left/right)
function onArrow(e) {
    if (filteredStudents.value.length === 0) return;
    if (
        document.activeElement &&
        ["input", "textarea"].includes(
            document.activeElement.tagName.toLowerCase()
        )
    )
        return;
    if (e.key === "ArrowLeft") {
        prevCard();
        e.preventDefault();
    } else if (e.key === "ArrowRight") {
        nextCard();
        e.preventDefault();
    }
}

onMounted(() => {
    window.addEventListener("keydown", onArrow);
    validateSession();
});
onBeforeUnmount(() => {
    window.removeEventListener("keydown", onArrow);
});

watch(filteredStudents, () => {
    updateOverflow();
    nextTick(() => {
        // If the filter reduces count, always scroll to first
        scrollToCard(0);
    });
});

const loadAllStudents = async () => {
    if (!sessionId.value) return;
    isLoading.value = true;
    try {
        const api = new PelajarApi(sessionId.value);
        let batchOffset = 0;
        let batch;
        let allStudents = [];
        const PAGE_SIZE = 100;
        do {
            batch = await api.getPelajar(
                "2024/2025",
                2,
                PAGE_SIZE,
                batchOffset
            );
            if (Array.isArray(batch) && batch.length > 0) {
                allStudents.push(
                    ...batch.map((item) => ({
                        name: item.nama,
                        yearCourse: `${item.tahun_kursus}/${item.kod_kursus}`,
                        faculty: item.kod_fakulti,
                        subjectCount: item.bil_subjek,
                        credit: 0,
                    }))
                );
                batchOffset += PAGE_SIZE;
            } else {
                batch = [];
            }
        } while (batch.length === PAGE_SIZE);

        students.value = allStudents;
        nextTick(() => {
            updateOverflow();
            scrollToCard(0);
        });
    } catch (err) {
        students.value = [];
        console.error("Failed to fetch students:", err);
    }
    isLoading.value = false;
};

const validateSession = async () => {
    const rawSessionId = lsData?.session_id;
    if (!rawSessionId) {
        console.error("No session_id found in localStorage.");
        return;
    }
    try {
        const res = await fetch(
            `http://web.fc.utm.my/ttms/auth-admin.php?session_id=${rawSessionId}`
        );
        if (!res.ok) {
            console.error("Session validation HTTP failed:", res.status);
            return;
        }
        const data = await res.json();
        if (!Array.isArray(data) || !data[0]?.session_id) {
            console.error("Invalid session response:", data);
            return;
        }
        sessionId.value = data[0].session_id;
        await loadAllStudents();
    } catch (err) {
        console.error("Error during session validation:", err);
    }
};
</script>

<template>
    <div class="bg-transparent min-h-screen flex flex-col">
        <Toggle />
        <ProfileBanner titleBanner="Student" />

        <!-- Search -->
        <div
            class="p-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Name</label>
                    <input
                        v-model="nama"
                        type="text"
                        placeholder="Type to search student name"
                        class="border px-2 py-1 rounded w-full"
                        autocomplete="off"
                    />
                </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Year</label>
                    <input
                        v-model="tahun"
                        type="text"
                        placeholder="Year"
                        class="border px-2 py-1 rounded w-full"
                        autocomplete="off"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Course</label>
                    <input
                        v-model="kursus"
                        type="text"
                        placeholder="Course"
                        class="border px-2 py-1 rounded w-full"
                        autocomplete="off"
                    />
                </div>
            </div>
        </div>

        <!-- Student Carousel -->
        <div
            v-if="isLoading"
            class="flex flex-col items-center justify-center py-10 min-h-[320px]"
        >
            <svg
                class="animate-spin h-10 w-10 text-blue-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                ></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                ></path>
            </svg>
            <span class="text-blue-700 font-medium text-base mt-2"
                >Loading students...</span
            >
        </div>

        <div v-else class="w-full flex flex-col items-center px-0">
            <div class="relative w-full max-w-full mx-auto select-none">
                <button
                    class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 border shadow p-1 rounded-full hover:bg-blue-50 transition text-xs"
                    :disabled="currentIndex <= 0 || !isOverflowing"
                    @click="prevCard"
                    aria-label="Previous"
                    style="
                        box-shadow: 0 1px 4px rgba(30, 64, 175, 0.07);
                        width: 26px;
                        height: 26px;
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-width="3"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <div
                    ref="sliderRef"
                    :class="[
                        'flex',
                        'gap-4',
                        'pb-8',
                        'pt-4',
                        'w-full',
                        isOverflowing
                            ? 'overflow-x-auto snap-x snap-mandatory'
                            : 'justify-center',
                    ]"
                    style="
                        scroll-behavior: smooth;
                        overflow-y: visible;
                        outline: none;
                    "
                    tabindex="0"
                >
                    <div
                        v-for="(student, idx) in filteredStudents"
                        :key="idx"
                        class="w-[220px] min-w-[220px] max-w-[220px] h-[370px] snap-center bg-blue-100 rounded-2xl shadow-sm p-6 flex flex-col items-start relative transition-all duration-500 border border-blue-100"
                        :style="{
                            transform:
                                currentIndex === idx && isOverflowing
                                    ? 'scale(1.05)'
                                    : 'scale(1)',
                            zIndex:
                                currentIndex === idx && isOverflowing ? 2 : 1,
                        }"
                    >
                        <button
                            class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
                            title="Maklumat Jadual"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="w-6 h-6 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <rect
                                    x="6"
                                    y="3"
                                    width="12"
                                    height="18"
                                    rx="2"
                                    stroke-width="2"
                                />
                                <path
                                    d="M9 7h6M9 11h6M9 15h3"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                        <div
                            class="font-semibold text-lg mt-2 mb-2 w-full text-blue-900 break-words leading-tight whitespace-pre-line"
                            style="word-break: break-word; white-space: normal"
                        >
                            {{ student.name }}
                        </div>
                        <div class="mb-2 text-base text-gray-700">
                            {{ student.yearCourse }}
                        </div>
                        <div
                            class="flex flex-col mt-auto w-full text-gray-700 text-sm gap-1"
                        >
                            <div><b>Faculty:</b> {{ student.faculty }}</div>
                            <div>
                                <b>Num. Subject:</b> {{ student.subjectCount }}
                            </div>
                            <div><b>Total Credit:</b> {{ student.credit }}</div>
                        </div>
                    </div>
                </div>
                <button
                    class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 border shadow p-1 rounded-full hover:bg-blue-50 transition text-xs"
                    :disabled="
                        currentIndex >= filteredStudents.length - 1 ||
                        !isOverflowing
                    "
                    @click="nextCard"
                    aria-label="Next"
                    style="
                        box-shadow: 0 1px 4px rgba(30, 64, 175, 0.07);
                        width: 26px;
                        height: 26px;
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-width="3"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
            <div
                v-if="!filteredStudents.length && !isLoading"
                class="text-center py-8 text-gray-400"
            >
                No students found.
            </div>
        </div>

        <Footer />
    </div>
</template>

<style scoped>
.shadow-sm {
    box-shadow: 0 2px 10px 0 rgba(59, 130, 246, 0.1);
}
</style>
