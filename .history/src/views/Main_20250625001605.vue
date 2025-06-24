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
    <div
        class="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 min-h-screen"
    >
        <Toggle />
        <ProfileBanner />

        <main class="flex-1 flex flex-col items-center p-2 pt-5">
            <!-- Floating Profile Avatar Card -->
            <div class="relative w-full max-w-xs flex justify-center mb-5">
                <div
                    class="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-16 bg-gradient-to-br from-blue-200 via-white to-pink-100 blur-lg rounded-full opacity-70 pointer-events-none"
                ></div>
                <div
                    class="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-blue-100 relative z-10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-20 w-20 text-blue-400"
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
                    <span
                        class="absolute -bottom-2 right-0 text-2xl animate-bounce"
                        >🎉</span
                    >
                </div>
            </div>

            <!-- 2 Badge Info Cards Side-by-Side -->
            <div class="flex flex-row gap-3 mb-4 w-full max-w-xs">
                <!-- Credit Info -->
                <div
                    class="flex-1 glass-card flex flex-col items-center justify-center p-3 rounded-xl border-2 border-blue-200 shadow-lg"
                >
                    <div
                        class="flex items-center gap-1 text-xl font-bold text-blue-800"
                    >
                        <span class="text-2xl">💠</span>
                        {{ creditInfo }}
                    </div>
                    <div
                        class="text-xs text-blue-600 mt-1 tracking-wide font-medium"
                    >
                        Credit Counted
                    </div>
                </div>
                <!-- Year/Course Info -->
                <div
                    class="flex-1 glass-card flex flex-col items-center justify-center p-3 rounded-xl border-2 border-pink-200 shadow-lg"
                >
                    <div
                        class="flex items-center gap-1 text-xl font-bold text-pink-700"
                    >
                        <span class="text-2xl">🎓</span>
                        {{ yearCourse }}
                    </div>
                    <div
                        class="text-xs text-pink-600 mt-1 tracking-wide font-medium"
                    >
                        Year / Course
                    </div>
                </div>
            </div>

            <!-- Session, Semester, Date: Large Info Cards -->
            <div class="w-full max-w-xs flex flex-col gap-3">
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >📆 Session</span
                    >
                    <span
                        class="text-blue-900 font-bold text-lg tracking-wide"
                        >{{ currentSession }}</span
                    >
                </div>
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >🎯 Semester</span
                    >
                    <span
                        class="text-blue-900 font-bold text-lg tracking-wide"
                        >{{ currentSemester }}</span
                    >
                </div>
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >📅 Date</span
                    >
                    <span
                        class="text-blue-800 font-semibold text-sm text-right leading-tight"
                        >{{ startDate }}<br class="block sm:hidden" />/
                        {{ endDate }}</span
                    >
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>

<style scoped>
.glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
}
</style>
