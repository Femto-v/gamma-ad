<script setup>
import { ref } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Dummy lecturer data
const lecturers = ref([
    {
        name: "AB. RAZAK BIN CHE HUSSIN",
        subjectCount: 0,
        sectionCount: 0,
        studentCount: 0,
    },
    {
        name: "ADILA FIRDAUS BINTI ARBAIN",
        subjectCount: 4,
        sectionCount: 3,
        studentCount: 0,
    },
    {
        name: "AIDA BT. ALI",
        subjectCount: 3,
        sectionCount: 4,
        studentCount: 0,
    },
    {
        name: "AHMAD FARIZ BIN ALI",
        subjectCount: 3,
        sectionCount: 5,
        studentCount: 0,
    },
    // ... add more as needed
]);
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <main>
            <!-- Banner -->
            <ProfileBanner titleBanner="Pensyarah" />

            <!-- Search Bar -->
            <div class="flex flex-col items-center">
            <div class="w-full max-w-lg relative z-10 px-4 -mt-10 mb-4">
                <div class="flex items-center bg-white rounded-2xl shadow px-4 py-2 border border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search"
                    class="w-full outline-none border-0 bg-transparent text-base"
                    />
                </div>
            </div>
            </div>

            <!-- Card UI Section -->
            <div class="flex flex-col gap-4 px-4 py-4">
                <div
                    v-for="(lecturer, index) in lecturers"
                    :key="index"
                    class="bg-blue-100 rounded-xl shadow p-4 relative"
                >
                    <!-- Top right button -->
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
                    <div class="font-semibold text-lg mt-2 mb-3">
                        {{ lecturer.name }}
                    </div>
                    <div class="flex gap-8 text-gray-700 text-[15px]">
                        <div>Num. of Section: {{ lecturer.sectionCount }}</div>
                        <div>Num. of Lecturer: {{ lecturer.subjectCount }}</div>
                        <div>Num. of Student: {{ lecturer.studentCount }}</div>
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
        </main>
        <Footer />
    </div>
</template>
