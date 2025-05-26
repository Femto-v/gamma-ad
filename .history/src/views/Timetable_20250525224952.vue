<script setup>
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";

import { ref } from "vue";
import { onMounted } from "vue";
import { userMatric } from "@/models/ApiConstants";
import { timetable } from "@/models/TimetableConstants";
import { days } from "@/models/TimetableConstants";

//retrieve data semester and sesi
const timetableData = ref(JSON.parse(JSON.stringify(timetable))); // Deep copy for display

// create object from timetableAPI class
const pelajarSubjekApi = new PelajarSubjekApi();

// Settings—change as needed:
const activeSemester = 2;
const activeSesi = "2024/2025";
const jadualSubjekApi = new JadualSubjekApi();

//get all data
onMounted(async () => {
    try {
        // 1. Fetch subject list
        const subjectList = await pelajarSubjekApi.getTimetableInfo(
            userMatric.value
        );
        console.log("Fetched subject list:", subjectList);
        if (!subjectList?.length) {
            console.warn("No subjects found!");
            return;
        }

        // 2. Filter for this semester/sesi
        const filteredSubjects = subjectList.filter(
            (s) => s.semester === activeSemester && s.sesi === activeSesi
        );

        if (!filteredSubjects.length) {
            console.warn("No subjects for current semester/sesi!");
            return;
        }

        // 3. Prepare parallel schedule fetches for each subject-section
        const schedulePromises = filteredSubjects.map((s) =>
            jadualSubjekApi.getSubjectSchedule({
                kod_subjek: s.kod_subjek,
                seksyen: s.seksyen,
                sesi: s.sesi,
                semester: s.semester,
            })
        );
        const allSchedules = (await Promise.all(schedulePromises)).flat();

        // 4. Map each schedule to the timetable grid
        allSchedules.forEach((item) => {
            const rowIdx = (item.masa ?? 1) - 1;
            const colIdx = (item.hari ?? 1) - 1;
            if (
                timetableData.value[rowIdx] &&
                timetableData.value[rowIdx].slots[colIdx] !== undefined
            ) {
                timetableData.value[rowIdx].slots[colIdx] =
                    item.kod_subjek +
                    (item.ruang?.nama_ruang_singkatan
                        ? ` @ ${item.ruang.nama_ruang_singkatan}`
                        : "");
            }
        });

        console.log("Final mapped timetable:", timetableData.value);
    } catch (error) {
        console.log("timetable error api: " + error);
    }
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />
        <!-- Main Content -->
        <main>
            <ProfileBanner />
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
                        <tr v-for="(row, index) in timetable" :key="index">
                            <td class="border border-black px-1 py-1">
                                {{ row.masa }}
                            </td>
                            <td class="border border-black px-1 py-1">
                                {{ row.waktu }}
                            </td>
                            <td
                                v-for="(slot, idx) in row.slots"
                                :key="idx"
                                class="border border-black px-1 py-1"
                            >
                                {{ slot }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <!-- Footer -->
        <p class="text-xs text-center mt-6 px-4">
            Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman
            web ini sila hubungi webmaster di
            <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                >ttms@fc.utm.my</a
            ><br />
            Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
        </p>
    </div>
</template>
