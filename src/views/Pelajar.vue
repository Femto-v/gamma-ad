<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import SessionService from "@/api/SessionService";
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
const isLoadingMore = ref(false);
const sessionId = ref("");
const currentIndex = ref(0);
const nextOffset = ref(0);
const hasMorePages = ref(true);
const sliderRef = ref(null);

const showTimetablePopup = ref(false);
const selectedMatric = ref("");

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const mapStudent = (item) => ({
    name: item.nama,
    year: item.tahun_kursus,
    course: item.kod_kursus,
    faculty: item.kod_fakulti,
    subjectCount: item.bil_subjek,
    no_matrik: item.no_matrik,
    no_kp: item.no_kp,
});

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

const setStudentsFromCache = (cached) => {
    if (Array.isArray(cached) && cached.length) {
        students.value = cached;
        nextOffset.value = cached.length;
        hasMorePages.value = cached.length >= 20;
    }
};

const loadStudentBatch = async (limit = 20, offset = 0) => {
    if (!sessionId.value) return;
    if (offset > 0 && isLoadingMore.value) return;
    if (offset === 0) {
        isLoading.value = true;
    } else {
        isLoadingMore.value = true;
    }

    try {
        const api = new PelajarApi(sessionId.value);
        const batch = await api.getPelajar(
            sesi.value,
            semester.value,
            limit,
            offset
        );
        const mapped = Array.isArray(batch) ? batch.map(mapStudent) : [];
        if (mapped.length) {
            const existingIds = new Set(
                students.value.map((student) => student.no_matrik)
            );
            const uniqueNew = mapped.filter(
                (student) => student.no_matrik && !existingIds.has(student.no_matrik)
            );
            if (uniqueNew.length) {
                students.value.push(...uniqueNew);
            }
            nextOffset.value = students.value.length;
            if (mapped.length < limit) {
                hasMorePages.value = false;
            }
            SessionService.savePrefetchedStudents(students.value);
        } else {
            hasMorePages.value = false;
        }
    } catch (err) {
        console.error("Failed to fetch student batch:", err);
    } finally {
        if (offset === 0) {
            isLoading.value = false;
        } else {
            isLoadingMore.value = false;
        }
    }
};

const loadInitialStudents = async () => {
    isLoading.value = true;
    try {
        const cached = SessionService.getPrefetchedStudents();
        setStudentsFromCache(cached);
        if (!cached.length) {
            await loadStudentBatch(20, 0);
        } else if (hasMorePages.value) {
            loadStudentBatch(20, nextOffset.value);
        }
        await nextTick();
        scrollToCard(0);
        currentIndex.value = 0;
    } catch (err) {
        console.error("Failed to load initial students:", err);
    } finally {
        isLoading.value = false;
    }
};

const validateSession = async () => {
    const session = await SessionService.validateSession();
    if (!session) {
        window.location.replace("/login");
        return;
    }
    sessionId.value = session.session_id;
    await loadInitialStudents();
};

const loadMoreOnDemand = () => {
    if (
        filteredStudents.value.length > 0 &&
        currentIndex.value >= filteredStudents.value.length - 5 &&
        hasMorePages.value &&
        !isLoadingMore.value
    ) {
        loadStudentBatch(20, nextOffset.value);
    }
};

watch(currentIndex, () => {
    loadMoreOnDemand();
});

watch([sesi, semester], () => {
    students.value = [];
    nextOffset.value = 0;
    hasMorePages.value = true;
    validateSession();
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
        if (deltaX > 0) prevCard();
        else nextCard();
    }
    touchStartX = null;
}

watch([sesi, semester], () => {
    students.value = [];
    nextOffset.value = 0;
    hasMorePages.value = true;
    validateSession();
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
    <div class="min-h-screen bg-[#f2f2f7] pb-10">
        <Toggle />
        <ProfileBanner titleBanner="Student Explorer" />

        <!-- Filters Section -->
        <div class="px-4 pt-5 pb-2">

            <!-- Session & Semester row -->
            <div class="flex gap-3 mb-4">
                <div class="flex-1">
                    <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Session
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <select
                            v-model="sesi"
                            class="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none"
                        >
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                            <option value="2022/2023">2022/2023</option>
                        </select>
                    </div>
                </div>
                <div class="w-28">
                    <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Semester
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <select
                            v-model="semester"
                            class="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none"
                        >
                            <option :value="1">Sem 1</option>
                            <option :value="2">Sem 2</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Search Filters -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <!-- Name -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        v-model="nama"
                        type="text"
                        placeholder="Search by name"
                        class="flex-1 text-[14px] bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
                    />
                </div>
                <!-- Year + Course row -->
                <div class="flex">
                    <div class="flex items-center gap-3 px-4 py-3 flex-1 border-r border-gray-50">
                        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <input
                            v-model="tahun"
                            type="text"
                            placeholder="Year"
                            class="flex-1 min-w-0 text-[14px] bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
                        />
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 flex-1">
                        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <input
                            v-model="kursus"
                            type="text"
                            placeholder="Course"
                            class="flex-1 min-w-0 text-[14px] bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
            <svg class="animate-spin w-8 h-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span class="text-[14px] text-gray-400 font-medium">Loading students&hellip;</span>
        </div>

        <!-- Carousel -->
        <div v-if="!isLoading" class="mt-4">
            <div class="relative w-full">
                <!-- Left chevron -->
                <button
                    class="carousel-nav left-2"
                    :disabled="currentIndex <= 0"
                    :class="currentIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'"
                    @click="prevCard"
                    aria-label="Previous"
                >
                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <!-- Fade overlays -->
                <div class="pointer-events-none absolute left-0 top-0 w-16 h-full z-10 bg-gradient-to-r from-[#f2f2f7] to-transparent"></div>
                <div class="pointer-events-none absolute right-0 top-0 w-16 h-full z-10 bg-gradient-to-l from-[#f2f2f7] to-transparent"></div>

                <!-- Slider -->
                <div
                    ref="sliderRef"
                    class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 no-scrollbar"
                    style="scroll-behavior: smooth;"
                    @scroll="onScrollSlider"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                >
                    <!-- Left phantom -->
                    <div :style="{ minWidth: 'calc(50vw - 100px)' }" aria-hidden="true"></div>

                    <!-- Student Cards -->
                    <div
                        v-for="(student, idx) in filteredStudents"
                        :key="student.no_matrik"
                        class="student-card snap-center"
                        :class="{ 'student-card-active': currentIndex === idx }"
                    >
                        <!-- Active indicator dot -->
                        <div v-if="currentIndex === idx" class="absolute top-3 right-3">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>

                        <!-- Avatar -->
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="min-w-0">
                                <div class="text-[13px] font-semibold text-gray-900 leading-tight truncate" :title="student.name">
                                    {{ student.name }}
                                </div>
                                <div class="text-[11px] text-gray-400 font-mono mt-0.5">{{ student.no_matrik }}</div>
                            </div>
                        </div>

                        <!-- ID field -->
                        <div class="info-row mb-3">
                            <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            <span class="info-label">IC</span>
                            <span class="info-value font-mono text-[11px]">{{ student.no_kp || '—' }}</span>
                        </div>

                        <!-- Divider -->
                        <div class="h-px bg-gray-100 mb-3"></div>

                        <!-- Details grid -->
                        <div class="space-y-2">
                            <div class="info-row">
                                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                                <span class="info-label">Year</span>
                                <span class="info-value">{{ student.year }}</span>
                            </div>
                            <div class="info-row">
                                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span class="info-label">Course</span>
                                <span class="info-value">{{ student.course }}</span>
                            </div>
                            <div class="info-row">
                                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span class="info-label">Faculty</span>
                                <span class="info-value">{{ student.faculty }}</span>
                            </div>
                            <div class="info-row">
                                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span class="info-label">Subjects</span>
                                <span class="info-value">{{ student.subjectCount }}</span>
                            </div>
                        </div>

                        <!-- Timetable button -->
                        <button
                            class="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0a3270] hover:bg-[#0d3d87] active:bg-[#08265a] text-white text-[12px] font-semibold rounded-xl transition-colors duration-150"
                            @click.stop="openStudentTimetable(student.no_matrik)"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Timetable
                        </button>
                    </div>

                    <!-- Right phantom -->
                    <div :style="{ minWidth: 'calc(50vw - 100px)' }" aria-hidden="true"></div>
                </div>

                <!-- Right chevron -->
                <button
                    class="carousel-nav right-2"
                    :disabled="currentIndex >= filteredStudents.length - 1"
                    :class="currentIndex >= filteredStudents.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'"
                    @click="nextCard"
                    aria-label="Next"
                >
                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <!-- Count + more loading -->
            <div class="px-4 mt-1 flex items-center justify-between">
                <span class="text-[12px] text-gray-400">
                    {{ filteredStudents.length }} student{{ filteredStudents.length !== 1 ? 's' : '' }} loaded
                </span>
                <span v-if="isLoadingMore" class="flex items-center gap-1.5 text-[12px] text-blue-500">
                    <svg class="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading more&hellip;
                </span>
            </div>

            <!-- Empty State -->
            <div
                v-if="!filteredStudents.length && !isLoading && !isLoadingMore"
                class="flex flex-col items-center justify-center py-16 px-8 text-center"
            >
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <p class="text-[15px] font-semibold text-gray-500">No students found</p>
                <p class="text-[13px] text-gray-400 mt-1">Try adjusting your search filters</p>
            </div>
        </div>

        <Footer />

        <!-- Timetable Popup -->
        <TimetableStudentPopup
            :show="showTimetablePopup"
            :matric="selectedMatric"
            :onClose="closeTimetablePopup"
        />
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.student-card {
    position: relative;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    width: 200px;
    min-width: 200px;
    max-width: 200px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    cursor: default;
}
.student-card-active {
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

.info-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.info-icon {
    width: 13px;
    height: 13px;
    color: #9ca3af;
    flex-shrink: 0;
}
.info-label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    min-width: 44px;
}
.info-value {
    font-size: 12px;
    color: #1f2937;
    font-weight: 600;
    flex: 1;
    truncate: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
</style>
