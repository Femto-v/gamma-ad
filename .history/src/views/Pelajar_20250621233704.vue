<script setup>
import { ref, watch, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// States
const nama = ref(""); // live search box (name)
const tahun = ref(""); // year filter (optional, see below)
const kursus = ref(""); // course filter (optional, see below)
const students = ref([]);
const isLoading = ref(false);
const sessionId = ref("");

// Session
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const PAGE_SIZE = 30; // result per query, adjust as needed

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
        await fetchStudents(); // load on mount
    } catch (err) {
        console.error("Error during session validation:", err);
    }
};

const fetchStudents = async () => {
    if (!sessionId.value) return;
    isLoading.value = true;
    try {
        const api = new PelajarApi(sessionId.value);
        // Pass nama (and optional tahun/kursus) as filter
        const filters = {};
        if (nama.value.trim()) filters.nama = nama.value.trim();
        if (tahun.value.trim()) filters.tahun = tahun.value.trim();
        if (kursus.value.trim()) filters.kursus = kursus.value.trim();
        const result = await api.getPelajar(
            "2024/2025",
            2,
            PAGE_SIZE,
            0,
            filters
        );
        students.value = (Array.isArray(result) ? result : []).map((item) => ({
            name: item.nama,
            yearCourse: `${item.tahun_kursus}/${item.kod_kursus}`,
            faculty: item.kod_fakulti,
            subjectCount: item.bil_subjek,
            credit: 0,
        }));
    } catch (err) {
        students.value = [];
        console.error("Failed to fetch students:", err);
    }
    isLoading.value = false;
};

// --- Debounce the API call (for nice UX) ---
let debounceTimer = null;
watch([nama, tahun, kursus], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchStudents();
    }, 400); // 400ms debounce
});

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
            <!-- Enable these for year/course server-side filtering -->

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

        <!-- Student Cards -->
        <div class="flex flex-col gap-4 px-4 py-2">
            <div
                v-for="(student, index) in students"
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
                v-if="!students.length && !isLoading"
                class="text-center py-6 text-gray-400"
            >
                No students found.
            </div>
        </div>

        <div
            class="flex justify-center py-4 text-sm text-gray-500"
            v-if="isLoading"
        >
            Loading students...
        </div>
        <Footer />
    </div>
</template>

<style scoped>
/* You can keep your previous styles here or customize */
</style>
