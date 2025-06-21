<script setup>
import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import PelajarApi from "@/api/PelajarApi.js";
import { userName, userMatric } from "@/constants/ApiConstants.js";

// Search fields
const nama = ref("");
const tahun = ref("");
const kursus = ref("");

// Student data and session state
const students = ref([]);
const offset = ref(0);
const isLoading = ref(false);
const hasMore = ref(true);
const sessionId = ref("");

// Get session info from localStorage
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

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
        const data = await res.json();

        if (!Array.isArray(data) || !data[0]?.session_id) {
            console.error("Invalid session response:", data);
            return;
        }

        sessionId.value = data[0].session_id;
        console.log("Confirmed session ID to use:", sessionId.value);

        // ✅ Initial unfiltered load
        loadStudents();
    } catch (err) {
        console.error("Session validation error:", err);
    }
};

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
            nama: nama.value || undefined,
            tahun: tahun.value || undefined,
            kod_kursus: kursus.value || undefined,
        };

        const result = await api.getPelajar(
            "2024/2025",
            2,
            3,
            offset.value,
            filters
        );
        console.log("🧪 Raw API result:", result);

        const studentList = Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
            ? result.data
            : [];

        if (studentList.length > 0) {
            const newStudents = studentList.map((item) => ({
                name: item.nama || "Unnamed",
                yearCourse: `${item.tahun_kursus || "?"}/${
                    item.kod_kursus || "?"
                }`,
                faculty: item.kod_fakulti || "-",
                subjectCount: item.bil_subjek || 0,
                credit: 0,
            }));

            students.value.push(...newStudents);
            offset.value += 3;
        } else {
            hasMore.value = false;
            console.warn("No student data found or filtered out.");
        }
    } catch (err) {
        console.error("❌ Failed to fetch students:", err);
    }

    isLoading.value = false;
};

// Search trigger
const searchStudents = () => {
    if (!nama.value && !tahun.value && !kursus.value) {
        alert("Please enter at least one search filter.");
        return;
    }
    loadStudents(true); // reset + filter
};

// Scroll to load more
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

        <!-- Search Form -->
        <div
            class="p-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Name</label>
                    <input
                        v-model="nama"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="e.g. ABANG"
                    />
                </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Year</label>
                    <input
                        v-model="tahun"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="e.g. 2"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Course</label>
                    <input
                        v-model="kursus"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                        placeholder="e.g. SECRH"
                    />
                </div>
            </div>
            <button
                @click="searchStudents"
                :disabled="!nama && !tahun && !kursus"
                class="mt-2 bg-white border border-black rounded px-6 py-1 text-lg flex items-center justify-center disabled:opacity-50"
            >
                <span class="mr-1">🔍</span> Search
            </button>
        </div>

        <!-- Student List -->
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
                class="text-center text-gray-400 py-4"
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
            v-if="!hasMore && students.length"
        >
            No more students to load.
        </div>

        <Footer />
    </div>
</template>
