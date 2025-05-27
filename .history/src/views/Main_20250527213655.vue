<script setup>
//__IMPORTS

import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";
import ProfileBanner from "@/components/ProfileBanner.vue";
import {
    currentSession,
    currentSemester,
    startDate,
    endDate,
} from "@/constants/ApiConstants";

//__DATA

// Reactive values for session display
const semesterApi = new SemesterApi();

//__FUNCTIONS

//on mounted
onMounted(async () => {
    const data = await semesterApi.getCurrentSemesterInfo();

    // Optionally pick the latest (first) entry
    if (data && data.length > 0) {
        const latest = data[0];
        currentSession.value = latest.sesi;
        currentSemester.value = latest.semester;
        startDate.value = latest.tarikh_mula;
        endDate.value = latest.tarikh_tamat;
    }
});
</script>

<template>
    <Toggle />
    <div class="bg-gray-100 min-h-screen">
        <!-- Main content -->
        <!-- Main card content, vertically centered -->
        <ProfileBanner />
        <main class="flex-1 flex flex-col items-center justify-center">
            <!-- Profile Icon -->
            <div
                class="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg mb-6 mt-4"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-20 w-20 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <circle cx="12" cy="8" r="4" stroke-width="2" />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 20c0-4 4-7 8-7s8 3 8 7"
                    />
                </svg>
            </div>

            <!-- Info cards (each with drop-shadow and rounded corners) -->
            <div class="w-full max-w-xs flex flex-col gap-4">
                <div
                    class="bg-blue-100 rounded-xl shadow p-4 flex justify-between items-center text-lg"
                >
                    <span class="font-semibold">Sesi</span>
                    <span>{{ currentSession }}</span>
                </div>
                <div
                    class="bg-blue-100 rounded-xl shadow p-4 flex justify-between items-center text-lg"
                >
                    <span class="font-semibold">Semester</span>
                    <span>{{ currentSemester }}</span>
                </div>
                <div
                    class="bg-blue-100 rounded-xl shadow p-4 flex justify-between items-center text-lg"
                >
                    <span class="font-semibold">Tarikh Mula/tamat</span>
                    <span>{{ startDate }} / {{ endDate }}</span>
                </div>
            </div>
        </main>
    </div>
</template>
