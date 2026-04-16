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
    <div class="min-h-screen bg-[#f2f2f7]">
        <Toggle />
        <ProfileBanner />

        <main class="px-4 pt-6 pb-10 max-w-md mx-auto">

            <!-- Stat Cards Row -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <!-- Credit Card -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 mb-3">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div class="text-2xl font-bold text-gray-900 leading-none mb-1">{{ creditInfo }}</div>
                    <div class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Credits</div>
                </div>

                <!-- Year / Course Card -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 mb-3">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div class="text-lg font-bold text-gray-900 leading-none mb-1 truncate">{{ yearCourse }}</div>
                    <div class="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Year / Course</div>
                </div>
            </div>

            <!-- Info List -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <!-- Session -->
                <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span class="text-[14px] font-medium text-gray-700">Session</span>
                    </div>
                    <span class="text-[14px] font-semibold text-gray-900">{{ currentSession }}</span>
                </div>

                <!-- Semester -->
                <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <span class="text-[14px] font-medium text-gray-700">Semester</span>
                    </div>
                    <span class="text-[14px] font-semibold text-gray-900">{{ currentSemester }}</span>
                </div>

                <!-- Date Range -->
                <div class="flex items-center justify-between px-4 py-3.5">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span class="text-[14px] font-medium text-gray-700">Period</span>
                    </div>
                    <span class="text-[13px] font-medium text-gray-500 text-right">{{ startDate }} &ndash; {{ endDate }}</span>
                </div>
            </div>

        </main>
        <Footer />
    </div>
</template>
