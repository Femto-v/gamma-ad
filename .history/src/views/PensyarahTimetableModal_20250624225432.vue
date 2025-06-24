<script setup>
import { ref, computed, onMounted, watch } from "vue";
import PensyarahApi from "@/api/PensyarahApi.js";
import JadualSubjekApi from "@/api/JadualSubjekApi.js";
import { timetable, days } from "@/constants/TimetableConstants";

const props = defineProps({
    lecturer: Object,
    onClose: Function,
});

const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));
const sesi = ref("2024/2025");
const semester = ref(2);
const selectedDay = ref(new Date().getDay());

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

// Fetch all subjects for this lecturer
onMounted(async () => {
    if (!props.lecturer?.no_pekerja) return;
    const api = new PensyarahApi();
    subjectList.value = await api.getPensyarahSubjects(
        props.lecturer.no_pekerja
    );
});

const filteredSubjects = computed(() =>
    subjectList.value.filter(
        (s) => s.semester === semester.value && s.sesi === sesi.value
    )
);

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
            const subjectInfo = filteredSubjects.value.find(
                (s) => s.kod_subjek === subjectCode
            );
            const subjectName = subjectInfo?.nama_subjek || "";
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
                subjectName,
                section,
                room,
                color: subjectColorMap.get(subjectCode),
            });
        }
    });
    return schedule;
});

// Rebuild timetable if subjects change
watch(
    [filteredSubjects, semester, sesi],
    async ([newFilteredSubjects]) => {
        timetableData.value = JSON.parse(JSON.stringify(timetable));
        if (!newFilteredSubjects.length) return;
        const jadualSubjekApi = new JadualSubjekApi();
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
    <div
        class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
    >
        <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 relative"
        >
            <button
                class="absolute right-4 top-3 text-xl"
                @click="props.onClose"
            >
                ×
            </button>
            <h3 class="text-xl font-bold mb-2 text-blue-900">
                Timetable: {{ props.lecturer.name }}
            </h3>
            <!-- Controls for sesi/semester if you wish -->
            <div class="flex gap-3 mb-3">
                <select v-model="sesi" class="border rounded px-2 py-1 text-sm">
                    <option
                        v-for="session in [
                            ...new Set(subjectList.map((s) => s.sesi)),
                        ]"
                        :key="session"
                        :value="session"
                    >
                        {{ session }}
                    </option>
                </select>
                <select
                    v-model="semester"
                    class="border rounded px-2 py-1 text-sm"
                >
                    <option :value="1">Sem 1</option>
                    <option :value="2">Sem 2</option>
                </select>
            </div>
            <div class="flex justify-between mb-4">
                <template v-for="(day, idx) in days" :key="day">
                    <button
                        @click="selectedDay = idx"
                        class="px-2 py-1 rounded"
                        :class="
                            selectedDay === idx
                                ? 'bg-blue-200 text-blue-900 font-bold'
                                : 'text-gray-500'
                        "
                    >
                        {{ day.substring(0, 3) }}
                    </button>
                </template>
            </div>
            <div class="space-y-3">
                <div
                    v-for="(item, index) in daySchedule"
                    :key="index"
                    class="flex items-start space-x-3 p-3 rounded-xl border-l-4 shadow-sm"
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
                <div
                    v-if="daySchedule.length === 0"
                    class="text-center py-4 text-gray-400"
                >
                    No classes scheduled for {{ days[selectedDay] }}
                </div>
            </div>
        </div>
    </div>
</template>
