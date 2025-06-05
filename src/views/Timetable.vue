<script setup>
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import { ref, computed, onMounted, watch } from "vue";
import { userMatric } from "@/constants/ApiConstants";
import { timetable } from "@/constants/TimetableConstants";
import { days } from "@/constants/TimetableConstants";
import Footer from "@/components/Footer.vue";

// Settings
const activeSemester = ref(1);
const activeSesi = ref("2024/2025");
const selectedDay = ref(0); // 0 = Sunday, 1 = Monday, etc.

// Available sessions/years
const availableSessions = computed(() => {
    const sessions = subjectList.value
        .map((s) => s.sesi)
        .filter((v, i, a) => a.indexOf(v) === i);

    return sessions.sort((a, b) => {
        const aStart = parseInt(a.split("/")[0], 10);
        const bStart = parseInt(b.split("/")[0], 10);
        return bStart - aStart;
    });
});

// Main reactive state
const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));

// API class instances
const pelajarSubjekApi = new PelajarSubjekApi();
const jadualSubjekApi = new JadualSubjekApi();

// Get current date info
const currentDate = new Date();
const currentMonth = currentDate.toLocaleDateString("en-US", { month: "long" });
const currentDayOfMonth = currentDate.getDate();
const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

// Set selected day to current day
selectedDay.value = currentDayOfWeek;

// Color palette for different subjects
const subjectColors = [
    "bg-purple-200 border-purple-300",
    "bg-blue-200 border-blue-300",
    "bg-pink-200 border-pink-300",
    "bg-orange-200 border-orange-300",
    "bg-green-200 border-green-300",
    "bg-yellow-200 border-yellow-300",
    "bg-indigo-200 border-indigo-300",
    "bg-red-200 border-red-300",
];

// Get all subjects for this student
onMounted(async () => {
    try {
        subjectList.value = await pelajarSubjekApi.getTimetableInfo(
            userMatric.value
        );
        console.log("subjectList: ", subjectList.value);
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

// Parse timetable data into structured format for the selected day
const daySchedule = computed(() => {
    const schedule = [];
    const subjectColorMap = new Map();
    let colorIndex = 0;

    timetableData.value.forEach((row, timeIndex) => {
        const daySlot = row.slots[selectedDay.value];
        if (daySlot && daySlot.trim()) {
            const lines = daySlot.split("\n");
            const subjectCode = lines[0]?.trim();
            const section = lines[1]?.replace("section :", "").trim();
            const room = lines[2]?.trim();

            // Find the subject name from filteredSubjects
            const subjectInfo = filteredSubjects.value.find(
                (s) => s.kod_subjek === subjectCode
            );
            const subjectName = subjectInfo?.nama_subjek || "";

            // Assign color to subject if not already assigned
            if (!subjectColorMap.has(subjectCode)) {
                subjectColorMap.set(
                    subjectCode,
                    subjectColors[colorIndex % subjectColors.length]
                );
                colorIndex++;
            }

            schedule.push({
                time: row.waktu,
                subject: subjectCode,
                subjectName: subjectName,
                section: section,
                room: room,
                color: subjectColorMap.get(subjectCode),
            });
        }
    });

    return schedule;
});

// Watch for changes to semester/sesi and update the timetable
watch(
    [filteredSubjects, activeSemester, activeSesi],
    async ([newFilteredSubjects]) => {
        timetableData.value = JSON.parse(JSON.stringify(timetable));
        if (!newFilteredSubjects.length) {
            console.warn("No subjects for current semester/sesi!");
            return;
        }

        const schedulePromises = newFilteredSubjects.map((s) =>
            jadualSubjekApi.getSubjectSchedule({
                kod_subjek: s.kod_subjek,
                seksyen: s.seksyen,
                sesi: s.sesi,
                semester: s.semester,
            })
        );
        const allSchedules = (await Promise.all(schedulePromises)).flat();

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
    },
    { immediate: true }
);
</script>

<template>
    <div class="bg-gray-50 min-h-screen">
        <Toggle />

        <!-- Mobile-style Header -->
        <div class="bg-white shadow-sm">
            <ProfileBanner titleBanner="Timetable" />

            <!-- Controls -->
            <div class="px-4 py-2">
                <div class="flex items-center justify-between mb-4">
                    <div></div>
                    <div class="flex items-center space-x-2">
                        <select
                            v-model="activeSesi"
                            class="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                        >
                            <option
                                v-for="session in availableSessions"
                                :key="session"
                                :value="session"
                                class="text-sm"
                            >
                                {{ session }}
                            </option>
                        </select>
                        <select
                            v-model.number="activeSemester"
                            class="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                        >
                            <option value="1">Sem 1</option>
                            <option value="2">Sem 2</option>
                        </select>
                    </div>
                </div>

                <!-- Week View -->
                <div class="flex justify-between items-center bg-white px-2 py-3 rounded-t-xl border-b border-gray-200">
                    <div class="flex-1 flex justify-between">
                        <template v-for="(day, idx) in days">
                            <div class="flex flex-col items-center flex-1 relative">
                            <!-- Day text -->
                            <button
                            @click="selectedDay = idx"
                            class="relative z-10 font-medium"
                            :class="[
                            selectedDay === idx
                                ? 'text-black font-semibold'
                                : 'text-gray-500 hover:text-blue-500'
                            ]"
                            >
                                {{ day.substring(0, 3) }}
                            </button>
                            <!-- Active highlight bar -->
                            <div
                                v-if="selectedDay === idx"
                                class="absolute left-1/2 -translate-x-1/2 top-0 w-12 h-7 bg-white rounded-xl shadow-lg border border-blue-200 flex items-center justify-center z-0"
                            ></div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Today Section -->
        <div class="px-4 py-4">
            <!-- Schedule Cards -->
            <div class="space-y-3">
                <div
                    v-for="(item, index) in daySchedule"
                    :key="index"
                    class="flex items-start space-x-3 p-4 rounded-xl border-l-4 shadow-sm"
                    :class="item.color"
                >
                    <div
                        class="flex flex-col items-center text-xs text-gray-600 min-w-[50px]"
                    >
                        <span class="font-medium">{{
                            item.time.split("-")[0]
                        }}</span>
                        <span class="text-gray-400">{{
                            item.time.split("-")[1]
                        }}</span>
                    </div>

                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800 mb-1">
                            {{ item.subject }}
                        </h4>
                        <p class="text-sm text-gray-600 mb-2">
                            {{ item.subjectName }}
                        </p>
                        <div
                            class="flex items-center space-x-4 text-sm text-gray-600"
                        >
                            <span>Section: {{ item.section }}</span>
                            <span v-if="item.room">📍 {{ item.room }}</span>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="daySchedule.length === 0" class="text-center py-8">
                    <div
                        class="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center"
                    >
                        <svg
                            class="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                        </svg>
                    </div>
                    <p class="text-gray-500 text-sm">
                        No classes scheduled for {{ days[selectedDay] }}
                    </p>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped>
/* Custom scrollbar for mobile feel */
::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}
</style>
