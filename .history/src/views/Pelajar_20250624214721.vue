<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import TimetableStudentPopup from "./TimetableStudentPopup.vue";
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
    <div class="bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen pb-8">
        <Toggle />
        <ProfileBanner titleBanner="🎓 Student Explorer" />

        <!-- Sesi & Semester Selectors -->
        <div
            class="flex flex-row gap-4 items-center justify-center px-4 pt-6 pb-2"
        >
            <div>
                <label class="mr-1 text-xs font-semibold text-blue-700"
                    >📅 Sesi:</label
                >
                <select
                    v-model="sesi"
                    class="border-2 border-blue-200 bg-white rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200 transition"
                >
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                </select>
            </div>
            <div>
                <label class="mr-1 text-xs font-semibold text-blue-700"
                    >🧭 Semester:</label
                >
                <select
                    v-model="semester"
                    class="border-2 border-blue-200 bg-white rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200 transition"
                >
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                </select>
            </div>
        </div>

        <!-- Search and Filters -->
        <div
            class="max-w-md mx-auto mt-2 flex flex-col gap-2 items-center px-4"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs font-bold text-blue-800"
                        >🔎 Name</label
                    >
                    <input
                        v-model="nama"
                        type="text"
                        placeholder="Type to search student name"
                        class="rounded-xl px-3 py-2 border-2 border-blue-100 focus:border-blue-400 outline-none bg-white shadow transition w-full"
                    />
                </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs font-bold text-blue-800"
                        >🎓 Year</label
                    >
                    <input
                        v-model="tahun"
                        type="text"
                        placeholder="Year"
                        class="rounded-xl px-3 py-2 border-2 border-blue-100 focus:border-blue-400 outline-none bg-white shadow transition w-full"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs font-bold text-blue-800"
                        >📚 Course</label
                    >
                    <input
                        v-model="kursus"
                        type="text"
                        placeholder="Course"
                        class="rounded-xl px-3 py-2 border-2 border-blue-100 focus:border-blue-400 outline-none bg-white shadow transition w-full"
                    />
                </div>
            </div>
        </div>

        <!-- Loading Spinner -->
        <div
            v-if="isLoading"
            class="flex flex-col items-center justify-center py-16"
        >
            <svg
                class="animate-spin h-12 w-12 text-blue-400 mb-2"
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
            <span class="text-blue-500 font-semibold text-lg"
                >Loading students...</span
            >
        </div>

        <!-- Student Card Carousel with Centered First Card -->
        <div
            v-if="!isLoading"
            class="w-full flex flex-col items-center px-0 mt-6"
        >
            <div class="relative w-full max-w-full mx-auto">
                <!-- Carousel navigation -->
                <button
                    class="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-blue-200 shadow p-2 rounded-full hover:bg-blue-50 transition text-xs"
                    :disabled="currentIndex <= 0"
                    @click="prevCard"
                    style="width: 38px; height: 38px"
                >
                    <span>⬅️</span>
                </button>
                <!-- Gradient overlays -->
                <div
                    class="pointer-events-none absolute left-0 top-0 w-20 h-full z-20 bg-gradient-to-r from-blue-50/80 via-white/20 to-transparent"
                ></div>
                <div
                    class="pointer-events-none absolute right-0 top-0 w-20 h-full z-20 bg-gradient-to-l from-blue-50/80 via-white/20 to-transparent"
                ></div>
                <div
                    ref="sliderRef"
                    class="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 no-scrollbar gap-8"
                    style="scroll-behavior: smooth; overflow-y: visible"
                    @scroll="onScrollSlider"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    tabindex="0"
                >
                    <!-- Left phantom padder for centering first card -->
                    <div
                        :style="{ minWidth: 'calc(50vw - 90px)' }"
                        aria-hidden="true"
                    ></div>
                    <!-- CARDS -->
                    <div
                        v-for="(student, idx) in filteredStudents"
                        :key="student.no_matrik"
                        class="group bg-white bg-opacity-90 hover:bg-blue-50 border-4 border-blue-200 hover:border-blue-400 rounded-3xl shadow-lg shadow-blue-100/40 backdrop-blur transition-all duration-300 w-[195px] min-w-[195px] max-w-[195px] h-[280px] p-4 flex flex-col justify-between items-start relative scale-100 hover:scale-105 cursor-pointer"
                        :style="{
                            boxShadow:
                                currentIndex === idx
                                    ? '0 8px 24px 2px #3b82f680'
                                    : '0 2px 10px 1px #60a5fa33',
                            borderWidth: currentIndex === idx ? '4px' : '2px',
                        }"
                    >
                        <div class="flex flex-col gap-1 w-full">
                            <div
                                class="font-bold text-xs text-blue-800 flex items-center gap-1"
                            >
                                👤
                                <span class="" :title="student.name">{{
                                    student.name
                                }}</span>
                            </div>
                            <div
                                class="text-[13px] mt-0.5 text-gray-700 flex flex-row gap-1 items-center"
                            >
                                <span class="font-bold">🆔</span>
                                <span class="font-mono">{{
                                    student.no_matrik
                                }}</span>
                            </div>
                            <div
                                class="text-[12px] text-gray-500 flex flex-row items-center gap-1"
                            >
                                <span>🔖</span>
                                <span>{{ student.no_kp || "-" }}</span>
                            </div>
                        </div>
                        <div class="flex-1"></div>
                        <div class="w-full flex flex-col gap-1 mt-2">
                            <div
                                class="flex flex-row gap-1 items-center text-blue-700 text-xs font-medium"
                            >
                                <span>🎓 Year:</span>
                                <span class="font-bold">{{
                                    student.year
                                }}</span>
                            </div>
                            <div
                                class="flex flex-row gap-1 items-center text-blue-700 text-xs font-medium"
                            >
                                <span>📚 Course:</span>
                                <span class="font-bold">{{
                                    student.course
                                }}</span>
                            </div>
                            <div
                                class="flex flex-row gap-1 items-center text-green-700 text-xs font-medium"
                            >
                                <span>🏢 Faculty:</span>
                                <span class="font-bold">{{
                                    student.faculty
                                }}</span>
                            </div>
                            <div
                                class="flex flex-row gap-1 items-center text-pink-700 text-xs font-medium"
                            >
                                <span>📖 Subjects:</span>
                                <span class="font-bold">{{
                                    student.subjectCount
                                }}</span>
                            </div>
                        </div>
                        <button
                            class="mt-4 px-4 py-2 bottom-3 rounded-2xl bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-600 text-white font-bold text-xs shadow-md hover:from-pink-400 hover:to-blue-700 transition active:scale-95 flex items-center gap-1"
                            title="View Timetable"
                            @click.stop="
                                openStudentTimetable(student.no_matrik)
                            "
                        >
                            <span>📅 Jadual</span>
                        </button>
                        <!-- animated emoji badge -->
                        <span
                            v-if="currentIndex === idx"
                            class="absolute top-3 right-3 text-xs animate-bounce"
                            title="Currently Selected"
                            >🌟</span
                        >
                    </div>
                    <!-- Right phantom padder for centering last card -->
                    <div
                        :style="{ minWidth: 'calc(50vw - 90px)' }"
                        aria-hidden="true"
                    ></div>
                </div>
                <button
                    class="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-blue-200 shadow p-2 rounded-full hover:bg-blue-50 transition text-xs"
                    :disabled="currentIndex >= filteredStudents.length - 1"
                    @click="nextCard"
                    style="width: 38px; height: 38px"
                >
                    <span>➡️</span>
                </button>
            </div>
            <div
                v-if="!filteredStudents.length && !isLoading"
                class="text-center py-8 text-gray-400 text-lg"
            >
                <span>😢 No students found.</span>
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
/* Animations for badge and button */
@keyframes pop {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}
button:active {
    animation: pop 0.12s;
}
</style>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
