<script setup>
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import { ref, computed, onMounted, watch } from "vue";
import { userMatric } from "@/constants/ApiConstants";
import { timetable } from "@/constants/TimetableConstants";
import { days } from "@/constants/TimetableConstants";

// Settings
const activeSemester = ref(1); // Default semester
const activeSesi = ref("2024/2025");

// Main reactive state
const subjectList = ref([]); // fetched from API
const timetableData = ref(JSON.parse(JSON.stringify(timetable))); // deep copy

// API class instances
const pelajarSubjekApi = new PelajarSubjekApi();
const jadualSubjekApi = new JadualSubjekApi();

// Get all subjects for this student
onMounted(async () => {
    try {
        subjectList.value = await pelajarSubjekApi.getTimetableInfo(
            userMatric.value
        );
        // Optionally set default semester/sesi based on data here
    } catch (error) {
        console.log("timetable error api: " + error);
    }
});

// Compute the filtered subjects based on the current semester/sesi
const filteredSubjects = computed(() =>
    subjectList.value.filter(
        (s) =>
            s.semester === activeSemester.value && s.sesi === activeSesi.value
    )
);

// Watch for changes to semester/sesi and update the timetable
watch(
    [filteredSubjects, activeSemester, activeSesi],
    async ([newFilteredSubjects]) => {
        // Reset timetable grid first
        timetableData.value = JSON.parse(JSON.stringify(timetable));
        if (!newFilteredSubjects.length) {
            console.warn("No subjects for current semester/sesi!");
            return;
        }
        // Fetch schedules for each subject
        const schedulePromises = newFilteredSubjects.map((s) =>
            jadualSubjekApi.getSubjectSchedule({
                kod_subjek: s.kod_subjek,
                seksyen: s.seksyen,
                sesi: s.sesi,
                semester: s.semester,
            })
        );
        const allSchedules = (await Promise.all(schedulePromises)).flat();

        // Map each schedule to the timetable grid
        allSchedules.forEach((item) => {
            const rowIdx = (item.masa ?? 1) - 1;
            const colIdx = (item.hari ?? 1) - 1;
            if (
                timetableData.value[rowIdx] &&
                timetableData.value[rowIdx].slots[colIdx] !== undefined
            ) {
                timetableData.value[rowIdx].slots[colIdx] =
                    `${item.kod_subjek} - ${item.seksyen}` +
                    (item.ruang?.nama_ruang_singkatan
                        ? ` @ ${item.ruang.nama_ruang_singkatan}`
                        : "");
            }
        });
        console.log("Final mapped timetable:", timetableData.value);
    },
    { immediate: true }
);

console.log("activeSemester: ", activeSemester.value);
</script>
