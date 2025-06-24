<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import TimetableStudentPopup from ".TimetableStudentPopup.vue";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// --- New State for Sesi & Semester ---
const sesi = ref("2024/2025");
const semester = ref(2);

const nama = ref("");
const tahun = ref("");
const kursus = ref("");
const students = ref([]);
const isLoading = ref(false);
const sessionId = ref("");
const currentIndex = ref(0);
const sliderRef = ref(null);

const showTimetablePopup = ref(false);
const selectedMatric = ref("");

const CARD_WIDTH = 175;

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Data fetching
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
                sesi.value,
                semester.value,
                PAGE_SIZE,
                batchOffset
            );
            if (Array.isArray(batch) && batch.length > 0) {
                allStudents.push(
                    ...batch.map((item) => ({
                        name: item.nama,
                        year: item.tahun_kursus,
                        course: item.kod_kursus,
                        faculty: item.kod_fakulti,
                        subjectCount: item.bil_subjek,
                        no_matrik: item.no_matrik,
                        no_kp: item.no_kp,
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
            String(s.year).includes(tahun.value.trim())
        );
    }
    if (kursus.value.trim()) {
        filtered = filtered.filter((s) =>
            s.course?.toLowerCase().includes(kursus.value.trim().toLowerCase())
        );
    }
    if (currentIndex.value >= filtered.length)
        currentIndex.value = Math.max(filtered.length - 1, 0);
    return filtered;
});

// Carousel logic with centering
function scrollToCard(idx) {
    const scroller = sliderRef.value;
    if (scroller && scroller.children[idx + 1]) {
        // +1 for left phantom
        const card = scroller.children[idx + 1];
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
function onScrollSlider() {
    if (!sliderRef.value) return;
    const cards = sliderRef.value.children;
    let closest = 1;
    let minDist = Infinity;
    for (let i = 1; i < cards.length - 1; i++) {
        const cardCenter =
            cards[i].offsetLeft -
            sliderRef.value.scrollLeft +
            cards[i].offsetWidth / 2;
        const scrollerCenter = sliderRef.value.offsetWidth / 2;
        const dist = Math.abs(cardCenter - scrollerCenter);
        if (dist < minDist) {
            minDist = dist;
            closest = i;
        }
    }
    currentIndex.value = closest - 1;
}

// Swipe support
let touchStartX = null;
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}
function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) prevCard(); // swipe right = prev
        else nextCard(); // swipe left = next
    }
    touchStartX = null;
}

// Reload students when sesi or semester changes
watch([sesi, semester], () => {
    loadAllStudents();
});

onMounted(() => {
    validateSession();
});

function openStudentTimetable(matric) {
    selectedMatric.value = matric;
    showTimetablePopup.value = true;
}
function closeTimetablePopup() {
    showTimetablePopup.value = false;
}
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Student" />

        <!-- Sesi & Semester Selectors -->
        <div class="flex flex-row gap-4 items-center justify-center px-4 pt-4">
            <div>
                <label class="mr-1 text-xs font-semibold text-gray-600"
                    >Sesi:</label
                >
                <select v-model="sesi" class="border rounded px-2 py-1 text-sm">
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                </select>
            </div>
            <div>
                <label class="mr-1 text-xs font-semibold text-gray-600"
                    >Semester:</label
                >
                <select
                    v-model="semester"
                    class="border rounded px-2 py-1 text-sm"
                >
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                </select>
            </div>
        </div>

        <!-- Search and Filters -->
        <div
            class="px-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
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

        <!-- Student Card Carousel with Centered First Card -->
        <div
            v-if="!isLoading"
            class="w-full flex flex-col items-center px-0 mt-4"
        >
            <div class="relative w-full max-w-full mx-auto">
                <button
                    class="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 border shadow p-1.5 rounded-full hover:bg-blue-50 transition text-sm"
                    :disabled="currentIndex <= 0"
                    @click="prevCard"
                    style="width: 32px; height: 32px"
                >
                    <svg
                        class="w-4 h-4 text-blue-700"
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
                <!-- Gradient overlays -->
                <div
                    class="pointer-events-none absolute left-0 top-0 w-16 h-full z-20 bg-gradient-to-r from-white/80 via-white/10 to-transparent"
                ></div>
                <div
                    class="pointer-events-none absolute right-0 top-0 w-16 h-full z-20 bg-gradient-to-l from-white/80 via-white/10 to-transparent"
                ></div>
                <div
                    ref="sliderRef"
                    class="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 no-scrollbar gap-6"
                    style="scroll-behavior: smooth; overflow-y: visible"
                    @scroll="onScrollSlider"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    tabindex="0"
                >
                    <!-- Left phantom padder for centering first card -->
                    <div
                        :style="{ minWidth: 'calc(50vw - 88px)' }"
                        aria-hidden="true"
                    ></div>
                    <div
                        v-for="(student, idx) in filteredStudents"
                        :key="idx"
                        class="overflow-visible w-[175px] min-w-[175px] max-w-[175px] h-[260px] snap-center bg-blue-100 rounded-xl shadow p-4 flex flex-col items-start relative transition-all duration-500 border border-blue-200"
                        :style="{
                            transform:
                                currentIndex === idx
                                    ? 'scale(1.07)'
                                    : 'scale(1)',
                            zIndex: currentIndex === idx ? 2 : 1,
                        }"
                    >
                        <div class="font-bold text-base mb-1 text-blue-900">
                            {{ student.name }}
                        </div>
                        <div class="text-xs text-gray-700 mb-1">
                            <span class="font-semibold">No. Matriks:</span>
                            {{ student.no_matrik }}<br />
                            <span class="font-semibold">No. KP:</span>
                            {{ student.no_kp }}
                        </div>
                        <div class="mb-1 text-xs">
                            <span class="font-semibold">Year:</span>
                            {{ student.year }}<br />
                            <span class="font-semibold">Course:</span>
                            {{ student.course }}
                        </div>
                        <div class="mb-1 text-xs">
                            <span class="font-semibold">Faculty:</span>
                            {{ student.faculty }}
                        </div>
                        <div class="mb-1 text-xs">
                            <span class="font-semibold">Num. Subject:</span>
                            {{ student.subjectCount }}
                        </div>
                        <button
                            class="absolute bottom-2 right-2 rounded bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-600 text-white font-bold text-xs px-3 py-1.5 shadow hover:scale-105 hover:shadow-lg transition active:scale-95 flex items-center gap-1"
                            title="Lihat Jadual Pelajar"
                            @click="openStudentTimetable(student.no_matrik)"
                        >
                            📅 Jadual
                        </button>
                    </div>
                    <!-- Right phantom padder for centering last card -->
                    <div
                        :style="{ minWidth: 'calc(50vw - 88px)' }"
                        aria-hidden="true"
                    ></div>
                </div>
                <button
                    class="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 border shadow p-1.5 rounded-full hover:bg-blue-50 transition text-sm"
                    :disabled="currentIndex >= filteredStudents.length - 1"
                    @click="nextCard"
                    style="width: 32px; height: 32px"
                >
                    <svg
                        class="w-4 h-4 text-blue-700"
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

        <!-- Timetable Popup Modal -->
        <TimetableStudentPopup
            :show="showTimetablePopup"
            :matric="selectedMatric"
            :onClose="closeTimetablePopup"
        />
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
</style>
