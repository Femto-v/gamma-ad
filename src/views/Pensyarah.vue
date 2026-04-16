<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PensyarahApi from "@/api/PensyarahApi.js";
import PensyarahTimetableModal from "./PensyarahTimetableModal.vue"; // create this
import { userName, userMatric } from "@/constants/ApiConstants.js";

const sesi = ref("2024/2025");
const semester = ref(2);

const nama = ref("");
const lecturers = ref([]);
const isLoading = ref(false);
const sessionId = ref("");
const currentIndex = ref(0);
const sliderRef = ref(null);

const showTimetable = ref(false);
const selectedLecturer = ref(null); // Will hold the selected lecturer's object

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const loadAllLecturers = async () => {
    if (!sessionId.value) return;
    isLoading.value = true;
    try {
        const api = new PensyarahApi(sessionId.value);
        const data = await api.getPensyarah(sesi.value, semester.value);
        lecturers.value = (Array.isArray(data) ? data : []).map((item) => ({
            name: item.nama,
            subjectCount: item.bil_subjek || 0,
            sectionCount: item.bil_seksyen || 0,
            studentCount: item.bil_pelajar || 0,
            no_pekerja: item.no_pekerja,
        }));
        await nextTick();
        scrollToCard(0);
        currentIndex.value = 0;
    } catch (err) {
        lecturers.value = [];
        console.error("Failed to fetch lecturers:", err);
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
        await loadAllLecturers();
    } catch {
        window.location.replace("/login");
    }
};

const filteredLecturers = computed(() => {
    let filtered = lecturers.value;
    if (nama.value.trim()) {
        filtered = filtered.filter((l) =>
            l.name?.toLowerCase().includes(nama.value.trim().toLowerCase())
        );
    }
    if (currentIndex.value >= filtered.length)
        currentIndex.value = Math.max(filtered.length - 1, 0);
    return filtered;
});

// Carousel logic
function scrollToCard(idx) {
    const scroller = sliderRef.value;
    if (scroller && scroller.children[idx + 1]) {
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
    if (currentIndex.value < filteredLecturers.value.length - 1) {
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
// Swipe
let touchStartX = null;
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}
function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) prevCard();
        else nextCard();
    }
    touchStartX = null;
}

function openTimetable(lecturer) {
    selectedLecturer.value = lecturer;
    showTimetable.value = true;
}

function closeTimetable() {
    showTimetable.value = false;
    selectedLecturer.value = null;
}

watch([sesi, semester], () => {
    loadAllLecturers();
});
onMounted(() => {
    validateSession();
});
</script>

<template>
    <div class="min-h-screen bg-[#f2f2f7] pb-10">
        <Toggle />
        <ProfileBanner titleBanner="Lecturer Explorer" />

        <!-- Filters -->
        <div class="px-4 pt-5 pb-2">
            <!-- Session & Semester -->
            <div class="flex gap-3 mb-4">
                <div class="flex-1">
                    <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Session</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <select v-model="sesi" class="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none">
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                            <option value="2022/2023">2022/2023</option>
                        </select>
                    </div>
                </div>
                <div class="w-28">
                    <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <select v-model="semester" class="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none">
                            <option :value="1">Sem 1</option>
                            <option :value="2">Sem 2</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Name Search -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="flex items-center gap-3 px-4 py-3">
                    <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input v-model="nama" type="text" placeholder="Search by lecturer name" class="flex-1 text-[14px] bg-transparent outline-none placeholder:text-gray-400 text-gray-900" />
                </div>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
            <svg class="animate-spin w-8 h-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span class="text-[14px] text-gray-400 font-medium">Loading lecturers&hellip;</span>
        </div>

        <!-- Carousel -->
        <div v-if="!isLoading" class="mt-4">
            <div class="relative w-full">
                <!-- Left chevron -->
                <button class="carousel-nav left-2" :disabled="currentIndex <= 0" :class="currentIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'" @click="prevCard" aria-label="Previous">
                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div class="pointer-events-none absolute left-0 top-0 w-16 h-full z-10 bg-gradient-to-r from-[#f2f2f7] to-transparent"></div>
                <div class="pointer-events-none absolute right-0 top-0 w-16 h-full z-10 bg-gradient-to-l from-[#f2f2f7] to-transparent"></div>

                <div ref="sliderRef" class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 no-scrollbar" style="scroll-behavior: smooth;"
                    @scroll="onScrollSlider" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                    <div :style="{ minWidth: 'calc(50vw - 130px)' }" aria-hidden="true"></div>

                    <!-- Lecturer Cards -->
                    <div v-for="(lecturer, idx) in filteredLecturers" :key="lecturer.no_pekerja"
                        class="lecturer-card snap-center" :class="{ 'lecturer-card-active': currentIndex === idx }">
                        <!-- Active indicator -->
                        <div v-if="currentIndex === idx" class="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500"></div>

                        <!-- Avatar + Name -->
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <div class="text-[13px] font-semibold text-gray-900 leading-tight" style="word-break: break-word;">{{ lecturer.name }}</div>
                                <div class="text-[11px] text-gray-400 font-mono mt-0.5">{{ lecturer.no_pekerja }}</div>
                            </div>
                        </div>

                        <div class="h-px bg-gray-100 mb-3"></div>

                        <!-- Stats -->
                        <div class="space-y-2">
                            <div class="lec-row">
                                <svg class="lec-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span class="lec-label">Students</span>
                                <span class="lec-value">{{ lecturer.studentCount }}</span>
                            </div>
                            <div class="lec-row">
                                <svg class="lec-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span class="lec-label">Subjects</span>
                                <span class="lec-value">{{ lecturer.subjectCount }}</span>
                            </div>
                            <div class="lec-row">
                                <svg class="lec-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span class="lec-label">Sections</span>
                                <span class="lec-value">{{ lecturer.sectionCount }}</span>
                            </div>
                        </div>

                        <!-- Timetable button -->
                        <button class="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0a3270] hover:bg-[#0d3d87] text-white text-[12px] font-semibold rounded-xl transition-colors duration-150"
                            @click.stop="openTimetable(lecturer)">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Timetable
                        </button>
                    </div>

                    <div :style="{ minWidth: 'calc(50vw - 130px)' }" aria-hidden="true"></div>
                </div>

                <!-- Right chevron -->
                <button class="carousel-nav right-2" :disabled="currentIndex >= filteredLecturers.length - 1" :class="currentIndex >= filteredLecturers.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'" @click="nextCard" aria-label="Next">
                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <!-- Empty State -->
            <div v-if="!filteredLecturers.length && !isLoading" class="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p class="text-[15px] font-semibold text-gray-500">No lecturers found</p>
                <p class="text-[13px] text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
        </div>

        <PensyarahTimetableModal v-if="showTimetable" :lecturer="selectedLecturer" :on-close="closeTimetable" />
        <Footer />
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.lecturer-card {
    position: relative;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    width: 220px;
    min-width: 220px;
    max-width: 220px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.lecturer-card-active {
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59,130,246,0.15);
    transform: translateY(-2px);
}
.carousel-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 36px;
    height: 36px;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 6px rgba(0,0,0,0.08);
    transition: background-color 0.15s;
}
.lec-row { display: flex; align-items: center; gap: 6px; }
.lec-icon { width: 13px; height: 13px; color: #9ca3af; flex-shrink: 0; }
.lec-label { font-size: 11px; color: #9ca3af; font-weight: 500; min-width: 52px; }
.lec-value { font-size: 12px; color: #1f2937; font-weight: 600; }
</style>
