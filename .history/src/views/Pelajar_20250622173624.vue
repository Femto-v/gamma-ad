<script setup>
import { ref, computed, onMounted } from "vue";
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
const currentIndex = ref(0);

const sliderRef = ref(null);

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Fetch and validate session
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
    } catch (err) {
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
    return filtered;
});

// Navigation
function nextCard() {
    if (currentIndex.value < filteredStudents.value.length - 1) {
        currentIndex.value++;
        scrollToCurrent();
    }
}
function prevCard() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
        scrollToCurrent();
    }
}
// Make selected card centered in the list
function scrollToCurrent() {
    if (!sliderRef.value) return;
    const card = sliderRef.value.children[currentIndex.value];
    if (card) {
        // Center the card in the view vertically
        const container = sliderRef.value;
        const scrollOffset =
            card.offsetTop -
            container.offsetTop -
            container.clientHeight / 2 +
            card.clientHeight / 2;
        container.scrollTo({
            top: scrollOffset,
            behavior: "smooth",
        });
    }
}

// Touch swipe for mobile
let touchStartY = null;
function handleTouchStart(e) {
    if (e.touches && e.touches.length) {
        touchStartY = e.touches[0].clientY;
    }
}
function handleTouchEnd(e) {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dy) > 30) {
        if (dy < 0) nextCard();
        else prevCard();
    }
    touchStartY = null;
}

onMounted(() => {
    validateSession();
});
</script>

<template>
    <div class="bg-gray-50 min-h-screen relative overflow-x-hidden">
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
            <span class="text-blue-700 font-medium text-base mt-2">
                Loading students...
            </span>
        </div>

        <!-- Student Card Vertical Carousel -->
        <div
            v-if="!isLoading"
            class="relative w-full flex flex-col items-center px-0 mt-6"
            style="min-height: 280px"
        >
            <!-- Top/bottom fade overlays -->
            <div class="fade-top"></div>
            <div class="fade-bottom"></div>

            <!-- Up Button -->
            <button
                :disabled="currentIndex <= 0"
                @click="prevCard"
                class="w-8 h-8 flex items-center justify-center bg-white/80 border shadow rounded-full hover:bg-blue-50 transition absolute left-1/2 -translate-x-1/2 -top-4 z-20"
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
                        d="M19 15l-7-7-7 7"
                    />
                </svg>
            </button>

            <!-- Card List -->
            <div
                ref="sliderRef"
                class="flex flex-col gap-2 overflow-y-auto snap-y snap-mandatory student-list-area no-scrollbar relative"
                style="
                    height: 210px;
                    max-height: 55vh;
                    min-height: 150px;
                    scroll-behavior: smooth;
                "
                @touchstart="handleTouchStart"
                @touchend="handleTouchEnd"
                tabindex="0"
            >
                <div
                    v-for="(student, idx) in filteredStudents"
                    :key="idx"
                    class="student-card w-[90vw] max-w-[230px] min-w-[130px] h-[110px] snap-center bg-blue-100 rounded-xl shadow p-3 flex flex-col items-start relative transition-all duration-500 border border-blue-200 mx-auto"
                    :style="{
                        borderWidth: idx === currentIndex ? '2px' : '1px',
                        borderColor:
                            idx === currentIndex ? '#1e3a8a' : '#bfdbfe',
                        background:
                            idx === currentIndex
                                ? 'rgba(191, 219, 254, 0.85)'
                                : '',
                        boxShadow:
                            idx === currentIndex
                                ? '0 4px 16px 0 rgba(30,64,175,0.10)'
                                : '0 1px 4px 0 rgba(30,64,175,0.06)',
                        scale: idx === currentIndex ? '1.03' : '1',
                    }"
                >
                    <div
                        class="font-semibold text-base mb-2 w-full text-blue-900 leading-tight whitespace-normal break-words"
                    >
                        {{ student.name }}
                    </div>
                    <div class="mb-1 text-base text-blue-800 font-medium">
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
                        class="absolute bottom-2 right-2 rounded bg-gray-200 hover:bg-gray-300 p-1"
                        style="z-index: 5"
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
                :disabled="currentIndex >= filteredStudents.length - 1"
                @click="nextCard"
                class="w-8 h-8 flex items-center justify-center bg-white/80 border shadow rounded-full hover:bg-blue-50 transition absolute left-1/2 -translate-x-1/2 -bottom-5 z-20"
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
                        d="M5 9l7 7 7-7"
                    />
                </svg>
            </button>

            <!-- No students found -->
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
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.student-list-area {
    position: relative;
    width: 100%;
    margin: 0 auto;
    /* background: #f8fafc; */
}
.fade-top,
.fade-bottom {
    position: absolute;
    left: 0;
    width: 100%;
    height: 32px;
    z-index: 22;
    pointer-events: none;
}
.fade-top {
    top: 0;
    background: linear-gradient(to bottom, #f8fafc 90%, transparent 100%);
}
.fade-bottom {
    bottom: 0;
    background: linear-gradient(to top, #f8fafc 90%, transparent 100%);
}
</style>
