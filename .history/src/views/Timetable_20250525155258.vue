<script setup>
import { ref, onMounted } from "vue";
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import { userMatric } from "@/constants/ApiConstants";

const subjectCode = ref("/");
const subjectSection = ref("/");
const bilPelajar = ref("-");
const subjectVenue = ref("-");
const subjectCodeAndSection = `${subjectCode} - ${subjectSection}`;

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
            console.log(data[0]);
        }
    } catch (error) {
        console.log("timetable error api : " + error);
    }
});

// Static timetable data (example only)
const timetableSlots = [
    "07:00 - 07:50", // Slot 1
    "08:00 - 08:50", // Slot 2
    "09:00 - 09:50", // Slot 3
    "10:00 - 10:50", // Slot 4
    "11:00 - 11:50", // Slot 5
    "12:00 - 12:50", // Slot 6
    "13:00 - 13:50", // Slot 7
    "14:00 - 14:50", // Slot 8
    "15:00 - 15:50", // Slot 9
    "16:00 - 16:50", // Slot 10
    "17:00 - 17:50", // Slot 11
    "18:00 - 18:50", // Slot 12
    "19:00 - 19:50", // Slot 13
    "20:00 - 20:50", // Slot 14
    "21:00 - 21:50", // Slot 15
    "22:00 - 22:50", // Slot 16
];
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
                            <th class="border border-black px-2 py-1">Ahad</th>
                            <th class="border border-black px-2 py-1">Isnin</th>
                            <th class="border border-black px-2 py-1">
                                Selasa
                            </th>
                            <th class="border border-black px-2 py-1">Rabu</th>
                            <th class="border border-black px-2 py-1">
                                Khamis
                            </th>
                            <th class="border border-black px-2 py-1">
                                Jumaat
                            </th>
                            <th class="border border-black px-2 py-1">Sabtu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in "timetableSlots" :key="index">
                            <td class="border border-black px-1 py-1">
                                {{ index + 1 }}
                            </td>
                            <td class="border border-black px-1 py-1">
                                {{ row.time }}
                            </td>
                            <td
                                v-for="(slot, idx) in row.slots"
                                :key="idx"
                                class="border border-black px-1 py-1"
                            >
                                <div
                                    v-if="slot !== ''"
                                    class="text-white font-bold p-1 rounded"
                                    :class="[
                                        slot.includes('SECJ3104')
                                            ? 'bg-cyan-500'
                                            : slot.includes('SECI0131')
                                            ? 'bg-pink-400'
                                            : slot.includes('SECJ3443')
                                            ? 'bg-red-600'
                                            : slot.includes('SECJ3623')
                                            ? 'bg-green-500'
                                            : slot.includes('SECJ3563')
                                            ? 'bg-yellow-300'
                                            : slot.includes('ULRS3032')
                                            ? 'bg-orange-400'
                                            : 'bg-gray-300',
                                    ]"
                                >
                                    {{ slot }}
                                </div>
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
