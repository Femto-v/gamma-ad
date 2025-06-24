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
    <div class="bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen pb-8">
        <Toggle />
        <ProfileBanner titleBanner="👨‍🏫 Lecturer Explorer" />

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

        <!-- Search Filter -->
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
                        placeholder="Type to search lecturer name"
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
                >Loading lecturers...</span
            >
        </div>

        <!-- Lecturer Card Carousel with Centered First Card -->
        <div
            v-if="!isLoading"
            class="w-full flex flex-col items-center px-0 mt-6"
        >
            <div class="relative w-full max-w-full mx-auto">
                <!-- Carousel navigation -->
                <button
                    class="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-white border-2 border-blue-200 shadow-lg p-3 rounded-full hover:bg-blue-200 transition text-xl flex items-center justify-center"
                    :disabled="currentIndex <= 0"
                    @click="prevCard"
                    style="width: 46px; height: 46px"
                >
                    <span>⬅️</span>
                </button>
                <button
                    class="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-white border-2 border-blue-200 shadow-lg p-3 rounded-full hover:bg-blue-200 transition text-2xl flex items-center justify-center"
                    :disabled="currentIndex >= filteredLecturers.length - 1"
                    @click="nextCard"
                    style="width: 46px; height: 46px"
                >
                    <span>➡️</span>
                </button>

                <!-- Gradient overlays for soft fade effect -->
                <div
                    class="pointer-events-none absolute left-0 top-0 w-24 h-full z-10 bg-gradient-to-r from-blue-50/80 via-white/20 to-transparent"
                ></div>
                <div
                    class="pointer-events-none absolute right-0 top-0 w-24 h-full z-10 bg-gradient-to-l from-blue-50/80 via-white/20 to-transparent"
                ></div>

                <div
                    ref="sliderRef"
                    class="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-10 pt-3 no-scrollbar"
                    style="scroll-behavior: smooth; overflow-y: visible"
                    @scroll="onScrollSlider"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    tabindex="0"
                >
                    <!-- Left phantom padder for centering first card -->
                    <div
                        :style="{ minWidth: 'calc(7vw)' }"
                        aria-hidden="true"
                    ></div>

                    <!-- LECTURER CARDS -->
                    <div
                        v-for="(lecturer, idx) in filteredLecturers"
                        :key="lecturer.no_pekerja"
                        class="group bg-white bg-opacity-95 border-2 border-blue-200 hover:border-blue-400 rounded-3xl shadow-lg shadow-blue-100/50 transition-all duration-300 flex flex-col justify-between items-stretch relative"
                        :class="
                            currentIndex === idx
                                ? 'scale-105 ring-2 ring-blue-300'
                                : 'scale-100'
                        "
                        style="
                            width: 96vw;
                            max-width: 350px;
                            min-width: 260px;
                            height: 325px;
                            padding: 1.4rem;
                        "
                    >
                        <div class="w-full mb-2">
                            <div
                                class="font-extrabold text-blue-900 flex items-center gap-2 leading-tight break-words whitespace-normal"
                            >
                                <span>👨‍🏫</span>
                                <span
                                    class="ml-1 break-words"
                                    style="word-break: break-word"
                                    >{{ lecturer.name }}</span
                                >
                            </div>
                        </div>
                        <div class="w-full flex flex-col gap-2 mb-3">
                            <div
                                class="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 flex items-center gap-2 text-base"
                            >
                                <span>🪪</span>
                                <span
                                    class="font-mono text-blue-800 break-all"
                                    >{{ lecturer.no_pekerja }}</span
                                >
                            </div>
                            <div
                                class="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-1.5 flex items-center gap-2 text-base"
                            >
                                <span>🧑‍🎓 Students:</span>
                                <span
                                    class="font-bold text-violet-700 break-all"
                                    >{{ lecturer.studentCount }}</span
                                >
                            </div>
                            <div
                                class="rounded-xl border border-pink-200 bg-pink-50/70 px-3 py-1.5 flex items-center gap-2 text-base"
                            >
                                <span>📖 Subjects:</span>
                                <span class="font-bold text-pink-700">{{
                                    lecturer.subjectCount
                                }}</span>
                            </div>
                            <div
                                class="rounded-xl border border-green-200 bg-green-50/70 px-3 py-1.5 flex items-center gap-2 text-base"
                            >
                                <span>🗂️ Section:</span>
                                <span class="font-bold text-green-800">{{
                                    lecturer.sectionCount
                                }}</span>
                            </div>
                        </div>
                        <button
                            class="w-full mt-2 rounded-xl bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-700 text-white font-bold text-base px-5 py-2 shadow-xl hover:scale-105 hover:from-pink-400 hover:to-blue-700 transition active:scale-95 flex items-center gap-2 justify-center"
                            @click.stop="openTimetable(lecturer)"
                            title="View Timetable"
                        >
                            <span class="text-sm">📅 Jadual</span>
                        </button>
                        <span
                            v-if="currentIndex === idx"
                            class="absolute top-5 right-5 text-2xl animate-bounce"
                            title="Currently Selected"
                            >🌟</span
                        >
                    </div>

                    <!-- Right phantom padder for centering last card -->
                    <div
                        :style="{ minWidth: 'calc(7vw)' }"
                        aria-hidden="true"
                    ></div>
                </div>
            </div>
            <div
                v-if="!filteredLecturers.length && !isLoading"
                class="text-center py-8 text-gray-400 text-lg"
            >
                <span>😢 No lecturers found.</span>
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
