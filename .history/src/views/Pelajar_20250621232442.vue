<script setup>
import { ref, computed, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// States
const nama = ref(""); // search by name (live)
const tahun = ref(""); // can add search later if needed
const kursus = ref(""); // can add search later if needed
const students = ref([]);
const offset = ref(0);
const isLoading = ref(false);
const hasMore = ref(true);
const sessionId = ref("");

// Get session from local storage
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const PAGE_SIZE = 10; // how many students to load per scroll/page

// Validate session and fetch initial students
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
        loadStudents();
    } catch (err) {
        console.error("Error during session validation:", err);
    }
};

// Infinite scroll / load more students
const loadStudents = async () => {
    if (!sessionId.value || isLoading.value || !hasMore.value) {
        return;
    }
    isLoading.value = true;
    try {
        const api = new PelajarApi(sessionId.value);
        const result = await api.getPelajar(
            "2024/2025",
            2,
            PAGE_SIZE,
            offset.value
        );
        if (Array.isArray(result) && result.length > 0) {
            const newStudents = result.map((item) => ({
                name: item.nama,
                yearCourse: `${item.tahun_kursus}/${item.kod_kursus}`,
                faculty: item.kod_fakulti,
                subjectCount: item.bil_subjek,
                credit: 0,
            }));
            students.value.push(...newStudents);
            offset.value += PAGE_SIZE;
        } else {
            hasMore.value = false;
        }
    } catch (err) {
        console.error("Failed to fetch students:", err);
    }
    isLoading.value = false;
};

// Client-side live filtering by name
const filteredStudents = computed(() => {
    const q = nama.value.trim().toLowerCase();
    if (!q) return students.value;
    return students.value.filter((student) =>
        student.name?.toLowerCase().includes(q)
    );
});

// Infinite scroll handler
const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
    ) {
        loadStudents();
    }
};

onMounted(() => {
    validateSession();
    window.addEventListener("scroll", handleScroll);
});
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Student" />

        <!-- Live Search Input -->
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
            <!-- Year and Course fields kept for future extensibility -->
            <div class="flex flex-row gap-2 w-full" v-if="false">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Year</label>
                    <input
                        v-model="tahun"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Course</label>
                    <input
                        v-model="kursus"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                    />
                </div>
            </div>
        </div>

        <!-- Student Cards (filtered by live search) -->
        <div class="flex flex-col gap-4 px-4 py-2">
            <div
                v-for="(student, index) in filteredStudents"
                :key="index"
                class="bg-blue-100 rounded-xl shadow p-4 relative"
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
                <div class="font-semibold text-lg mt-2 mb-1">
                    {{ student.name }}
                </div>
                <div class="mb-1 text-base">{{ student.yearCourse }}</div>
                <div
                    class="flex flex-row flex-wrap items-center justify-between text-gray-700 text-sm"
                >
                    <div>{{ student.faculty }}</div>
                    <div>num. Subject: {{ student.subjectCount }}</div>
                    <div>Total Credit: {{ student.credit }}</div>
                </div>
            </div>
            <div
                v-if="filteredStudents.length === 0 && !isLoading"
                class="text-center py-6 text-gray-400"
            >
                No students found.
            </div>
        </div>

        <div
            class="flex justify-center py-4 text-sm text-gray-500"
            v-if="isLoading"
        >
            Loading more students...
        </div>
        <div
            class="flex justify-center py-4 text-sm text-gray-400"
            v-if="!hasMore"
        >
            No more students to load.
        </div>

        <Footer />
    </div>
</template>
