<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
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
const currentIndex = ref(0);
const sliderRef = ref(null);

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
        await nextTick();
        scrollToCard(0);
        currentIndex.value = 0;
    } catch (err) {
        students.value = [];
        console.error("Failed to fetch students:", err);
    }
    isLoading.value = false;
};

const validateSession = async () => {
    const rawSessionId = lsData?.session_id;
    if (!rawSessionId) {
        window.location.replace("/login");
        return;
    }
    try {
        const res = await fetch(
            `http://web.fc.utm.my/ttms/auth-admin.php?session_id=${rawSessionId}`
        );
        if (!res.ok) {
            window.location.replace("/login");
            return;
        }
        let data;
        try {
            data = await res.json();
        } catch (err) {
            window.location.replace("/login");
            return;
        }
        if (!Array.isArray(data) || !data[0]?.session_id) {
            window.location.replace("/login");
            return;
        }
        sessionId.value = data[0].session_id;
        await loadAllStudents();
    } catch {
        window.location.replace("/login");
    }
};

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
    if (currentIndex.value >= filtered.length)
        currentIndex.value = Math.max(filtered.length - 1, 0);
    return filtered;
});

function scrollToCard(idx) {
    const scroller = sliderRef.value;
    if (scroller && scroller.children[idx]) {
        const card = scroller.children[idx];
        const center =
            card.offsetTop - scroller.offsetHeight / 2 + card.offsetHeight / 2;
        scroller.scrollTo({
            top: center,
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
    if (!sliderRef.value) return;
    const cards = sliderRef.value.children;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
        const cardCenter =
            cards[i].offsetTop -
            sliderRef.value.scrollTop +
            cards[i].offsetHeight / 2;
        const scrollerCenter = sliderRef.value.offsetHeight / 2;
        const dist = Math.abs(cardCenter - scrollerCenter);
        if (dist < minDist) {
            minDist = dist;
            closest = i;
        }
    }
    currentIndex.value = closest;
}

let touchStartY = null;
function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
}
function handleTouchEnd(e) {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;
    if (Math.abs(deltaY) > 40) {
        if (deltaY > 0) prevCard(); // swipe down
        else nextCard(); // swipe up
    }
    touchStartY = null;
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

        <!-- Student Card Vertical Carousel -->
        <div
            v-if="!isLoading"
            class="w-full flex flex-col items-center px-0 mt-4 relative"
            style="min-height: 320px"
        >
            <!-- Up Button -->
            <button
                class="mb-2 w-9 h-9 flex items-center justify-center bg-white/80 border shadow rounded-full hover:bg-blue-50 transition disabled:opacity-60 z-10"
                :disabled="currentIndex <= 0"
                @click="prevCard"
            >
                <svg
                    class="w-5 h-5 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 15l-7-7-7 7"
                    />
                </svg>
            </button>
            <div
                ref="sliderRef"
                class="flex flex-col gap-2 border-3 overflow-y-auto snap-y snap-mandatory no-scrollbar relative"
                style="
                    height: 230px;
                    max-height: 55vh;
                    min-height: 180px;
                    scroll-behavior: smooth;
                "
                @scroll="onScrollSlider"
                @touchstart="handleTouchStart"
                @touchend="handleTouchEnd"
                tabindex="0"
            >
                <div
                    v-for="(student, idx) in filteredStudents"
                    :key="idx"
                    class="student-card w-[92vw] max-w-[250px] min-w-[140px] h-[150px] snap-center bg-blue-100 rounded-xl shadow p-3 flex flex-col items-start relative transition-all duration-500 border border-blue-200 mx-auto"
                    :style="{
                        transform:
                            currentIndex === idx ? 'scale(1.04)' : 'scale(1)',
                        zIndex: currentIndex === idx ? 2 : 1,
                    }"
                >
                    <div
                        class="font-semibold text-sm mb-1 w-full text-blue-900 leading-tight whitespace-normal break-words"
                    >
                        {{ student.name }}
                    </div>
                    <div class="mb-1 text-[13px] text-blue-800 font-medium">
                        {{ student.yearCourse }}
                    </div>
                    <div
                        class="flex flex-col gap-1 w-full text-gray-700 text-xs mt-1"
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
                    <button
                        class="absolute bottom-2 right-2 rounded bg-gray-200 hover:bg-gray-300 p-2"
                        title="Maklumat Jadual"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-4 h-4 text-gray-600"
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
                </div>
            </div>
            <!-- Down Button -->
            <button
                class="mt-2 w-9 h-9 flex items-center justify-center bg-white/80 border shadow rounded-full hover:bg-blue-50 transition disabled:opacity-60 z-10"
                :disabled="currentIndex >= filteredStudents.length - 1"
                @click="nextCard"
            >
                <svg
                    class="w-5 h-5 text-blue-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 9l7 7 7-7"
                    />
                </svg>
            </button>

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
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.snap-y {
    scroll-snap-type: y mandatory;
}
.snap-center {
    scroll-snap-align: center;
}
</style>
