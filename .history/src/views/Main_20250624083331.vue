<script setup>
//__IMPORTS
import { ref, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import {
    currentSession,
    currentSemester,
    startDate,
    endDate,
    userMatric,
} from "@/constants/ApiConstants";

// Dummy values for credit and year/course (replace with real data later)
const subjects = ref([]);
const creditInfo = ref("-");
const yearCourse = ref("-/-");

//__DATA
const semesterApi = new SemesterApi();
const pelajarSubjekApi = new PelajarSubjekApi();

// Extract credit from kod_subjek (last digit)
function getCredit(kodSubjek) {
    // Get the last number sequence in kod_subjek (e.g., "SECJ3104" -> 4)
    const match = kodSubjek.match(/\d+$/);
    return match ? Number(match[0].slice(-1)) : 0;
}

// Add credit property to each subject
const subjectsWithCredit = computed(() => {
    return subjects.value.map((subj) => ({
        ...subj,
        kredit: getCredit(subj.kod_subjek),
    }));
});

// Only include subjects before the current sesi/semester
const subjectsBeforeCurrentSemester = computed(() => {
    return subjectsWithCredit.value.filter((subj) => {
        // Sesi comparison (string), semester (number)
        // If sesi < current, include
        if (subj.sesi < currentSession.value) return true;
        // If sesi == current, only semester < current
        if (
            subj.sesi === currentSession.value &&
            subj.semester < currentSemester.value
        )
            return true;
        return false;
    });
});

creditInfo.value = computed(() =>
    subjectsBeforeCurrentSemester.value.reduce(
        (sum, subj) => sum + subj.kredit,
        0
    )
);

// Returns yearCourse string "tahun_kursus / kod_kursus" from latest subject
yearCourse.value = computed(() => {
    if (!subjects.value.length) return "";
    // Find subject with largest tahun_kursus
    const latestSubject = subjects.value.reduce((latest, subj) => {
        return subj.tahun_kursus > (latest?.tahun_kursus ?? 0) ? subj : latest;
    }, null);
    // Return string "tahun_kursus / kod_kursus"
    return latestSubject
        ? `${latestSubject.tahun_kursus} / ${latestSubject.kod_kursus}`
        : "";
});

//__FUNCTIONS
onMounted(async () => {
    // get current semester info
    const data = await semesterApi.getCurrentSemesterInfo();
    if (data && data.length > 0) {
        const latest = data[0];
        currentSession.value = latest.sesi;
        currentSemester.value = latest.semester;
        startDate.value = latest.tarikh_mula;
        endDate.value = latest.tarikh_tamat;
    }
    // get pelajar subjects
    const dataSubject = await pelajarSubjekApi.getTimetableInfo(
        userMatric.value
    );
    console.log(dataSubject);
    // Ensure dataSubject is an array
    subjects.value = Array.isArray(dataSubject) ? dataSubject : [dataSubject];
});
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner />

        <main class="flex-1 flex flex-col items-center justify-center p-10">
            <!-- Profile Icon -->
            <div
                class="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg mb-4 mt-4"
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

            <!-- 2 Small Info Cards Side-by-Side -->
            <div class="flex flex-row gap-4 mb-4 w-full max-w-xs">
                <!-- Credit Info Card -->
                <div
                    class="flex-1 bg-blue-100 rounded-xl shadow p-2 flex flex-col items-center justify-center"
                >
                    <div class="flex items-center gap-2 text-lg">
                        <!-- Chart Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-6 h-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <rect
                                x="3"
                                y="12"
                                width="4"
                                height="6"
                                rx="1"
                                stroke-width="2"
                            />
                            <rect
                                x="9"
                                y="9"
                                width="4"
                                height="9"
                                rx="1"
                                stroke-width="2"
                            />
                            <rect
                                x="15"
                                y="6"
                                width="4"
                                height="12"
                                rx="1"
                                stroke-width="2"
                            />
                        </svg>
                        <span class="font-medium">{{ creditInfo }}</span>
                    </div>
                    <div class="text-xs mt-1 text-center">Credit counted</div>
                </div>
                <!-- Year/Course Info Card -->
                <div
                    class="flex-1 bg-blue-100 rounded-xl shadow p-2 flex flex-col items-center justify-center"
                >
                    <div class="flex items-center gap-2 text-lg">
                        <!-- Graduation Cap Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-6 h-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                d="M12 5L2 9.5l10 4.5 10-4.5L12 5Z"
                                stroke-width="2"
                            />
                            <path
                                d="M6 10.5V15c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5v-4.5"
                                stroke-width="2"
                            />
                        </svg>
                        <span class="font-medium">{{ yearCourse }}</span>
                    </div>
                    <div class="text-xs mt-1 text-center">Year / Course</div>
                </div>
            </div>

            <!-- 3 Full-width Info Cards -->
            <div class="w-full max-w-xs flex flex-col gap-2">
                <div
                    class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center"
                >
                    <span class="font-medium">Session</span>
                    <span>{{ currentSession }}</span>
                </div>
                <div
                    class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center"
                >
                    <span class="font-medium">Semester</span>
                    <span>{{ currentSemester }}</span>
                </div>
                <div
                    class="bg-blue-100 rounded-xl shadow p-3 flex justify-between items-center"
                >
                    <span class="font-medium">Start/End Date</span>
                    <span class="text-xs">{{ startDate }} / {{ endDate }}</span>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>
