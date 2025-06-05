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

// Dummy values for credit and year/course (replace with real data later)
const creditInfo = ref("18/127");
const yearCourse = ref("3 / SECJH");

//__DATA
const semesterApi = new SemesterApi();

//__FUNCTIONS
onMounted(async () => {
    const data = await semesterApi.getCurrentSemesterInfo();
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
  <div class="bg-gray-100 min-h-screen">
    <Toggle />
    <ProfileBanner />

    <main class="flex-1 flex flex-col items-center justify-center">
      <!-- Profile Icon -->
      <div class="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg mb-4 mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="8" r="4" stroke-width="2" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
        </svg>
      </div>

      <!-- 2 Small Info Cards Side-by-Side -->
      <div class="flex flex-row gap-4 mb-4 w-full max-w-xs">
        <!-- Credit Info Card -->
        <div class="flex-1 bg-blue-100 rounded-xl shadow p-2 flex flex-col items-center justify-center">
          <div class="flex items-center gap-2 text-lg">
            <!-- Chart Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="12" width="4" height="6" rx="1" stroke-width="2"/>
              <rect x="9" y="9" width="4" height="9" rx="1" stroke-width="2"/>
              <rect x="15" y="6" width="4" height="12" rx="1" stroke-width="2"/>
            </svg>
            <span class="font-medium">{{ creditInfo }}</span>
          </div>
          <div class="text-xs mt-1 text-center">Credit counted</div>
        </div>
        <!-- Year/Course Info Card -->
        <div class="flex-1 bg-blue-100 rounded-xl shadow p-2 flex flex-col items-center justify-center">
          <div class="flex items-center gap-2 text-lg">
            <!-- Graduation Cap Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 5L2 9.5l10 4.5 10-4.5L12 5Z" stroke-width="2"/>
              <path d="M6 10.5V15c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5v-4.5" stroke-width="2"/>
            </svg>
            <span class="font-medium">{{ yearCourse }}</span>
          </div>
          <div class="text-xs mt-1 text-center">Year / Course</div>
        </div>
      </div>

      <!-- 3 Full-width Info Cards -->
      <div class="w-full max-w-xs flex flex-col gap-2">
        <div class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center">
          <span class="font-medium">Session</span>
          <span>{{ currentSession }}</span>
        </div>
        <div class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center">
          <span class="font-medium">Semester</span>
          <span>{{ currentSemester }}</span>
        </div>
        <div class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center">
          <span class="font-medium">Start/End Date</span>
          <span class="text-xs">{{ startDate }} / {{ endDate }}</span>
        </div>
      </div>
    </main>
  </div>
</template>