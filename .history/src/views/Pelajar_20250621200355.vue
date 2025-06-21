<script setup>
import { ref, onMounted, watch } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// Filters
const searchTerm = ref({
    nama: "",
    tahun: "",
    kursus: "",
});

// Debounce timer
let searchTimer = null;

// Students & session state
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

// Validate session
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
        loadStudents(true); // Initial load
    } catch (err) {
        console.error("Error during session validation:", err);
    }
};

// Load students (reset on search)
const loadStudents = async (isSearch = false) => {
    if (!sessionId.value || isLoading.value || (!hasMore.value && !isSearch)) {
        return;
    }

    if (isSearch) {
        students.value = [];
        offset.value = 0;
        hasMore.value = true;
    }

    isLoading.value = true;

    try {
        const api = new PelajarApi(sessionId.value);
        const filters = {
            nama: searchTerm.value.nama || undefined,
            tahun: searchTerm.value.tahun || undefined,
            kod_kursus: searchTerm.value.kursus || undefined,
        };

        const result = await api.getPelajar(
            "2024/2025",
            2,
            3,
            offset.value,
            filters
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
            offset.value += 3;
        } else {
            hasMore.value = false;
        }
    } catch (err) {
        console.error("Failed to fetch students:", err);
    }

    isLoading.value = false;
};

// Scroll loader
const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
    ) {
        loadStudents();
    }
};

// Watch for filter input (with debounce)
watch(
    searchTerm,
    () => {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            loadStudents(true);
        }, 500); // 500ms delay
    },
    { deep: true }
);

onMounted(() => {
    validateSession();
    window.addEventListener("scroll", handleScroll);
});
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Student" />

        <!-- Filter Form -->
        <div
            class="p-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Name</label>
                    <input
                        v-model="searchTerm.nama"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="Enter student name"
                    />
                </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Year</label>
                    <input
                        v-model="searchTerm.tahun"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="e.g. 2"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Course</label>
                    <input
                        v-model="searchTerm.kursus"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="e.g. SECRH"
                    />
                </div>
            </div>
        </div>

        <!-- Student Cards -->
        <div class="flex flex-col gap-4 px-4 py-2">
            <div
                v-if="students && students.length > 0"
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

            <div v-else-if="!isLoading" class="text-center text-gray-400 py-6">
                No students found.
            </div>
        </div>

        <!-- Loading & Footer -->
        <div
            class="flex justify-center py-4 text-sm text-gray-500"
            v-if="isLoading"
        >
            Loading more students...
        </div>
        <div
            class="flex justify-center py-4 text-sm text-gray-400"
            v-if="!hasMore && students.length > 0"
        >
            No more students to load.
        </div>

        <Footer />
    </div>
</template>
