<script setup>
import { ref, onMounted } from "vue";
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import { userMatric } from "@/constants/ApiConstants";
import { timetable } from "@/constants/TimetableConstants";
import { days } from "@/constants/TimetableConstants";
import axios from "axios";
//retrieve data semester and sesi

// create object from timetableAPI class
const pelajarSubjekApi = new PelajarSubjekApi();

//get all data
onMounted(async () => {
    try {
        const data = await pelajarSubjekApi.getTimetableInfo({
            no_matrik: userMatric.value,
        });

        if (data && data.length > 0) {
            for (i = 0; i < data.length; i++) {
                const curr = data[i];
                //semester and sesi adjustment

                subjectCode.value = curr.kod_subjek;
                subjectSection.value = curr.seksyen;
            }
            console.log(data);
        }
    } catch (error) {
        console.log("timetable error api : " + error);
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
