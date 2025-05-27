<script setup>
import { ref } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Filters
const nama = ref("");
const tahun = ref("");
const kursus = ref("");

// Dummy student data
const students = ref([
    {
        name: "'AISYAH BINTI MOHAMAD SHIRAJUDDIN",
        yearCourse: "2/SECJH",
        faculty: "FSKSM",
        subjectCount: 6,
        credit: 16,
    },
    {
        name: "ATHARALIKH BAIHAQI MUBARAK",
        yearCourse: "2/SECJH",
        faculty: "FSKSM",
        subjectCount: 6,
        credit: 16,
    },
    {
        name: "ABDUL RASHEED KHAN BIN YUSOF KHAN",
        yearCourse: "2/SECJH",
        faculty: "FSKSM",
        subjectCount: 6,
        credit: 16,
    },
    // Add more as needed...
]);

const searchStudents = () => {
    // Placeholder logic for demo
    alert(`Search for: ${nama.value}, ${tahun.value}, ${kursus.value}`);
};
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <!-- Banner -->
        <ProfileBanner titleBanner="Pelajar" />

        <!-- Search Form -->
        <div
            class="p-4 flex flex-col gap-2 items-center text-sm max-w-md mx-auto"
        >
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Nama</label>
                    <input
                        v-model="nama"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                    />
                </div>
            </div>
            <div class="flex flex-row gap-2 w-full">
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Tahun</label>
                    <input
                        v-model="tahun"
                        type="text"
                        class="border px-2 py-1 rounded w-full"
                    />
                </div>
                <div class="flex-1 flex flex-col">
                    <label class="mb-1 ml-1 text-xs">Kursus</label>
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

        <!-- Card List -->
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
                    <!-- Document Icon SVG -->
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
                    <div>
                        {{ student.faculty }}
                    </div>
                    <div>Bil. Subjek: {{ student.subjectCount }}</div>
                    <div>Total kredit: {{ student.credit }}</div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="text-sm flex justify-center py-4 space-x-2">
            <button>&lt;&lt;</button>
            <button class="font-bold underline">1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>&gt;&gt;</button>
        </div>

        <!-- Footer -->
        <p class="text-xs text-center px-4 pb-6">
            Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman
            web ini sila hubungi webmaster di
            <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                >ttms@fc.utm.my</a
            ><br />
            Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
        </p>
    </div>
</template>
