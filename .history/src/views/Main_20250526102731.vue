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
    <div class="bg-gray-100 min-h-screen">
        <Toggle />
        <!-- Main content -->
        <main>
            <ProfileBanner />

            <div class="p-4">
                <div class="bg-blue-100 rounded-xl shadow p-4">
                    <div class="grid grid-cols-2 text-sm">
                        <div class="font-bold">Sesi</div>
                        <div>{{ currentSession }}</div>
                        <div class="font-bold">Semester</div>
                        <div>{{ currentSemester }}</div>
                        <div class="font-bold">Tarikh Mula/Tamat</div>
                        <div>{{ startDate }} / {{ endDate }}</div>
                    </div>
                </div>

                <p class="text-xs text-center mt-6">
                    Jika anda mempunyai sebarang komen atau pertanyaan mengenai
                    halaman web ini sila hubungi webmaster di
                    <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                        >ttms@fc.utm.my</a
                    ><br />
                    Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
                </p>
            </div>
        </main>
    </div>
</template>
