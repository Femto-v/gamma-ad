<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PensyarahApi from "@/api/PensyarahApi.js";
import PensyarahTimetableModal from "@/components/PensyarahTimetableModal.vue"; // create this
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
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Lecturer" />
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
        <!-- Search Filter -->
        <div
            class="px-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Name</label>
                    <input
                        v-model="nama"
                        type="text"
                        placeholder="Type to search lecturer name"
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
                >Loading lecturers...</span
            >
        </div>
        <!-- Lecturer Card Carousel -->
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
                    <div
                        :style="{ minWidth: 'calc(50vw - 88px)' }"
                        aria-hidden="true"
                    ></div>
                    <div
                        v-for="(lecturer, idx) in filteredLecturers"
                        :key="idx"
                        class="overflow-visible w-[175px] min-w-[175px] max-w-[175px] h-[200px] snap-center bg-blue-100 rounded-xl shadow p-4 flex flex-col items-start relative transition-all duration-500 border border-blue-200"
                        :style="{
                            transform:
                                currentIndex === idx
                                    ? 'scale(1.07)'
                                    : 'scale(1)',
                            zIndex: currentIndex === idx ? 2 : 1,
                        }"
                    >
                        <div
                            class="font-semibold text-sm mb-1 w-full text-blue-900 leading-tight whitespace-normal break-words"
                        >
                            {{ lecturer.name }}
                        </div>
                        <div
                            class="flex flex-col gap-1 w-full text-gray-700 text-xs mt-1"
                        >
                            <div>
                                <span class="font-semibold">Num. Section:</span>
                                {{ lecturer.sectionCount }}
                            </div>
                            <div>
                                <span class="font-semibold">Num. Subject:</span>
                                {{ lecturer.subjectCount }}
                            </div>
                            <div>
                                <span class="font-semibold">Num. Student:</span>
                                {{ lecturer.studentCount }}
                            </div>
                        </div>
                        <button
                            class="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-gradient-to-tr from-blue-200 via-blue-400 to-blue-600 text-white font-bold text-xs shadow hover:scale-105 hover:shadow-lg hover:from-blue-500 hover:to-blue-800 transition active:scale-95 flex items-center gap-1"
                            @click="openTimetable(lecturer)"
                        >
                            📅 Jadual
                        </button>
                    </div>
                    <div
                        :style="{ minWidth: 'calc(50vw - 88px)' }"
                        aria-hidden="true"
                    ></div>
                </div>
                <button
                    class="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 border shadow p-1.5 rounded-full hover:bg-blue-50 transition text-sm"
                    :disabled="currentIndex >= filteredLecturers.length - 1"
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
                v-if="!filteredLecturers.length && !isLoading"
                class="text-center py-8 text-gray-400"
            >
                No lecturers found.
            </div>
        </div>
        <PensyarahTimetableModal
            v-if="showTimetable"
            :lecturer="selectedLecturer"
            :on-close="closeTimetable"
        />
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
</style>
