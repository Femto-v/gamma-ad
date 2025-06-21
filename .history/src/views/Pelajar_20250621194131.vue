<script setup>
import { ref, onMounted } from "vue";
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

const validateSession = async () => {
    const rawSessionId = lsData?.session_id;
    if (!rawSessionId) {
        console.error("No session_id found in localStorage.");
        return;
    }

    try {
        console.log("Calling session validation API with:", rawSessionId);
        const res = await fetch(
            `http://web.fc.utm.my/ttms/auth-admin.php?session_id=${rawSessionId}`
        );
        if (!res.ok) {
            console.error("Session validation HTTP failed:", res.status);
            return;
        }

        const data = await res.json();
        console.log("Validated session data:", data);

        if (!data.session_id) {
            console.error("Invalid session response:", data);
            return;
        }

        sessionId.value = data.session_id;
        console.log("Confirmed session ID to use:", sessionId.value);
        loadStudents(); // 🔁 fetch students
    } catch (err) {
        console.error("Error during session validation:", err);
    }
};

const loadStudents = async () => {
    if (!sessionId.value || isLoading.value || !hasMore.value) {
        console.log("Skipping loadStudents because of guard clause.");
        return;
    }

    isLoading.value = true;

    try {
        console.log(`Fetching students at offset ${offset.value}`);
        const api = new PelajarApi(sessionId.value);
        const result = await api.getPelajar("2024/2025", 2, 3, offset.value);
        console.log("Student API result:", result);

        if (Array.isArray(result) && result.length > 0) {
            const newStudents = result.map((item) => ({
                name: item.nama,
                yearCourse: `${item.tahun_kursus}/${item.kod_kursus}`,
                faculty: item.kod_fakulti,
                subjectCount: item.bil_subjek,
                credit: 0,
            }));

            students.value.push(...newStudents);

            // 🔍 Final log: full list of students so far
            console.log("✅ Current student list:", students.value);

            offset.value += 3;
        } else {
            hasMore.value = false;
            console.warn("No student data received.");
        }
    } catch (err) {
        console.error("Failed to fetch students:", err);
    }

    isLoading.value = false;
};

const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
    ) {
        loadStudents();
    }
};

const searchStudents = () => {
    alert(`Search for: ${nama.value}, ${tahun.value}, ${kursus.value}`);
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

        <!-- Filter Form -->
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
            <button
                @click="searchStudents"
                class="mt-2 bg-white border border-black rounded px-6 py-1 text-lg flex items-center justify-center"
            >
                <span class="mr-1">🔍</span>
            </button>
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
