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
                timetableData.value[rowIdx].slots[colIdx] = `${
                    item.kod_subjek
                }\nsection : ${item.seksyen}\n   ${
                    item.ruang?.nama_ruang_singkatan ?? ""
                }`;
            }
        });
        console.log("Final mapped timetable:", timetableData.value);
    },
    { immediate: true }
);

console.log("activeSemester: ", activeSemester.value);
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />
        <!-- Main Content -->
        <main class="grid">
            <ProfileBanner titleBanner="Timetable" />
            <div class="flex justify-center text-xs">
                <label class="m-4 place-self-center px-4 py-2 rounded">
                    Semester:
                    <select
                        v-model.number="activeSemester"
                        class="border px-2 py-1 rounded ml-2"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </label>
            </div>

            <!-- Timetable Table -->
            <div class="overflow-x-auto p-4">
                <table
                    class="w-full border border-black text-sm text-center bg-[#d0e7f7]"
                >
                    <thead class="bg-[#b8d4ea]">
                        <tr>
                            <th class="border border-black px-2 py-1">Masa</th>
                            <th class="border border-black px-2 py-1">Waktu</th>
                            <th
                                v-for="(day, i) in days"
                                :key="i"
                                class="border border-black px-2 py-1"
                            >
                                {{ day }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in timetableData" :key="index">
                            <td class="border border-black px-1 py-1">
                                {{ row.masa }}
                            </td>
                            <td class="border border-black px-1 py-1">
                                {{ row.waktu }}
                            </td>
                            <td
                                v-for="(slot, idx) in row.slots"
                                :key="idx"
                                class="border border-black px-1 py-1 text-xs"
                            >
                                {{ slot }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <!-- Footer -->
        <p class="text-xs text-center p-4">
            Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman
            web ini sila hubungi webmaster di
            <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                >ttms@fc.utm.my</a
            ><br />
            Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
        </p>
    </div>
</template>
