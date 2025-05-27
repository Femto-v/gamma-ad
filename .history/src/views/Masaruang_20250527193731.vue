<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Days and time slots
const days = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const selectedDay = ref("Ahad");

const timeSlots = [
    "07:00 AM - 07:50 AM",
    "08:00 AM - 08:50 AM",
    "09:00 AM - 09:50 AM",
    "10:00 AM - 10:50 AM",
    "11:00 AM - 11:50 AM",
    "12:00 PM - 12:50 PM",
    "01:00 PM - 01:50 PM",
    "02:00 PM - 02:50 PM",
    "03:00 PM - 03:50 PM",
    "04:00 PM - 04:50 PM",
    "05:00 PM - 05:50 PM",
    "06:00 PM - 06:50 PM",
];

// Track selected time slots
const selectedTimes = ref([]);

// Week options
const selectedWeek = ref("kuliah");
const userStart = ref("");
const userEnd = ref("");

// Submit
const handleSubmit = () => {
    console.log("Selected Day:", selectedDay.value);
    console.log("Selected Times:", selectedTimes.value);
    console.log("Week:", selectedWeek.value);
    if (selectedWeek.value === "manual") {
        console.log("From:", userStart.value, "To:", userEnd.value);
    }
    alert("Permintaan dihantar. (Simulasi)");
};
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <main>
            <!-- Banner -->
            <ProfileBanner titleBanner="Analysis Masa & Ruang" />

            <!-- Selection Table -->
            <div class="p-4">
                <div
                    class="overflow-x-auto mx-auto max-w-3xl border border-black rounded-lg"
                >
                    <table class="w-full text-sm text-center bg-[#d0e7f7]">
                        <thead>
                            <tr>
                                <th class="border border-black px-2 py-1">
                                    Hari
                                </th>
                                <th class="border border-black px-2 py-1">
                                    Masa
                                </th>
                                <th class="border border-black px-2 py-1">
                                    Waktu
                                </th>
                                <th class="border border-black px-2 py-1">
                                    Tarikh
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(time, i) in timeSlots" :key="i">
                                <td
                                    v-if="i === 0"
                                    :rowspan="timeSlots.length"
                                    class="border border-black px-2 py-1"
                                >
                                    <div
                                        class="flex flex-col items-start space-y-1"
                                    >
                                        <label
                                            v-for="day in days"
                                            :key="day"
                                            class="inline-flex items-center"
                                        >
                                            <input
                                                type="radio"
                                                :value="day"
                                                v-model="selectedDay"
                                                class="mr-2"
                                            />
                                            {{ day }}
                                        </label>
                                    </div>
                                </td>
                                <td class="border border-black px-2 py-1">
                                    {{ i + 1 }}
                                </td>
                                <td class="border border-black px-2 py-1">
                                    <label class="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            :value="time"
                                            v-model="selectedTimes"
                                            class="mr-2"
                                        />
                                        {{ time }}
                                    </label>
                                </td>
                                <td class="border border-black px-2 py-1">
                                    <div
                                        class="flex flex-col items-start space-y-1"
                                    >
                                        <label class="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="kuliah"
                                                v-model="selectedWeek"
                                                class="mr-2"
                                            />
                                            Minggu Kuliah<br />
                                            <span class="text-xs ml-4"
                                                >2025-03-16 ↔ 2025-06-28</span
                                            >
                                        </label>
                                        <label class="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="seminggu"
                                                v-model="selectedWeek"
                                                class="mr-2"
                                            />
                                            Minggu Semasa<br />
                                            <span class="text-xs ml-4"
                                                >2025-04-20 ↔ 2025-04-26</span
                                            >
                                        </label>
                                        <label class="inline-flex items-center">
                                            <input
                                                type="radio"
                                                value="manual"
                                                v-model="selectedWeek"
                                                class="mr-2"
                                            />
                                            Input Pengguna
                                            <div class="flex gap-2 mt-1 ml-4">
                                                <input
                                                    v-model="userStart"
                                                    type="date"
                                                    class="border px-1 py-0.5 text-xs"
                                                />
                                                <span class="text-xs">↔</span>
                                                <input
                                                    v-model="userEnd"
                                                    type="date"
                                                    class="border px-1 py-0.5 text-xs"
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Submit Button -->
                <div class="text-center mt-6">
                    <button
                        @click="handleSubmit"
                        class="bg-blue-800 text-white text-lg font-bold py-2 px-8 rounded-lg hover:bg-blue-900"
                    >
                        Hantar
                    </button>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <p class="text-xs text-center px-4 pb-6">
            Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman
            web ini sila hubungi webmaster di
            <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                >ttms@fc.utm.my</a
            ><br />
            Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
        </p>
    </div>
</template>
