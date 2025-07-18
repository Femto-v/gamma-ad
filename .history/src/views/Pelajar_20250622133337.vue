<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// States
const nama = ref("");
const tahun = ref("");
const kursus = ref("");
const students = ref([]);
const isLoading = ref(false);
const sessionId = ref("");

const sliderRef = ref(null);
const currentIndex = ref(0); // track which card is in view

// Session
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const loadAllStudents = async () => {
    if (!sessionId.value) return;
    isLoading.value = true;
    try {
        const api = new PelajarApi(sessionId.value);
        let batchOffset = 0;
        let batch;
        let allStudents = [];
        const PAGE_SIZE = 100; // increase if backend allows

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
        currentIndex.value = 0;
        await nextTick(); // ensure slider has items
        scrollToCard(0);
        console.log("All students loaded:", students.value.length);
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

// Client-side computed filter
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

function scrollToCard(idx) {
    // Snap to card idx in slider
    const scroller = sliderRef.value;
    if (scroller && scroller.children[idx]) {
        const card = scroller.children[idx];
        scroller.scrollTo({
            left: card.offsetLeft - scroller.offsetLeft,
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
function onScrollSlider() {
    // update currentIndex as user scrolls (debounced for performance)
    if (!sliderRef.value) return;
    const cards = sliderRef.value.children;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
        const cardLeft = cards[i].offsetLeft - sliderRef.value.scrollLeft;
        if (Math.abs(cardLeft) < minDist) {
            minDist = Math.abs(cardLeft);
            closest = i;
        }
    }
    currentIndex.value = closest;
}

onMounted(() => {
    validateSession();
});
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Student" />

        <!-- Search and Filters -->
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
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Course</label>
                    <input
                        v-model="kursus"
                        type="text"
                        placeholder="Course"
                        class="border px-2 py-1 rounded w-full"
                    />
                </div>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div
            v-if="isLoading"
            class="flex flex-col items-center justify-center py-10"
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
                />
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                />
            </svg>
            <span class="text-blue-700 font-medium text-base mt-2"
                >Loading students...</span
            >
        </div>

        <!-- Student "Room Card" Carousel -->
        <div v-if="!isLoading" class="w-full flex flex-col items-center px-4">
            <div class="relative w-full max-w-3xl mx-auto">
                <button
                    class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 border hover:bg-blue-50 transition"
                    :disabled="currentIndex <= 0"
                    @click="prevCard"
                    style="left: -30px"
                >
                    <svg
                        class="w-6 h-6 text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <div
                    ref="sliderRef"
                    class="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2"
                    style="scroll-behavior: smooth"
                    @scroll="onScrollSlider"
                    tabindex="0"
                >
                    <div
                        v-for="(student, idx) in filteredStudents"
                        :key="idx"
                        class="w-[325px] min-w-[325px] max-w-[325px] snap-center bg-blue-100 rounded-2xl shadow-xl p-6 flex flex-col items-start relative transition-all duration-500"
                        :style="{
                            transform:
                                currentIndex === idx
                                    ? 'scale(1.03)'
                                    : 'scale(1)',
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
                            class="font-semibold text-xl mt-4 mb-1 truncate w-full"
                        >
                            {{ student.name }}
                        </div>
                        <div class="mb-2 text-lg">{{ student.yearCourse }}</div>
                        <div
                            class="flex flex-col gap-1 w-full text-gray-700 text-base mt-1"
                        >
                            <div>
                                <span class="font-semibold">Faculty:</span>
                                {{ student.faculty }}
                            </div>
                            <div>
                                <span class="font-semibold">Num. Subject:</span>
                                {{ student.subjectCount }}
                            </div>
                            <div>
                                <span class="font-semibold">Total Credit:</span>
                                {{ student.credit }}
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 border hover:bg-blue-50 transition"
                    :disabled="currentIndex >= filteredStudents.length - 1"
                    @click="nextCard"
                    style="right: -30px"
                >
                    <svg
                        class="w-6 h-6 text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
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
/* Beautiful scroll-snap horizontal carousel styling */
::-webkit-scrollbar {
    display: none;
}
.snap-x {
    scroll-snap-type: x mandatory;
}
.snap-center {
    scroll-snap-align: center;
}
</style>
