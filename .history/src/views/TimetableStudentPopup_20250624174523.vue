<script setup>
import { ref, computed, onMounted, watch } from "vue";
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import { timetable, days } from "@/constants/TimetableConstants";

// Props
const props = defineProps({
    matric: { type: String, required: true },
    show: { type: Boolean, required: true },
    onClose: { type: Function, required: true },
});

// State
const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));
const activeSesi = ref("2024/2025");
const activeSemester = ref(1);
const selectedDay = ref(new Date().getDay());
const loading = ref(false);

// Subject colors
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

// Fetch subjects on open
watch(
    () => props.matric,
    async (matric) => {
        if (!matric) return;
        loading.value = true;
        const pelajarSubjekApi = new PelajarSubjekApi();
        subjectList.value = await pelajarSubjekApi.getTimetableInfo(matric);
        loading.value = false;
    },
    { immediate: true }
);

const filteredSubjects = computed(() =>
    subjectList.value.filter(
        (s) =>
            s.semester === activeSemester.value && s.sesi === activeSesi.value
    )
);

const daySchedule = computed(() => {
    const schedule = [];
    const subjectColorMap = new Map();
    let colorIndex = 0;
    timetableData.value.forEach((row) => {
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

// Watch for semester/sesi changes and update the timetable
watch(
    [filteredSubjects, activeSemester, activeSesi],
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
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
        >
            <div
                class="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-auto max-h-[90vh] p-5 relative"
            >
                <button
                    @click="onClose"
                    class="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                    title="Close"
                >
                    &times;
                </button>
                <h3
                    class="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2"
                >
                    📅 Student Timetable
                    <span class="text-xs text-gray-500">({{ matric }})</span>
                </h3>
                <div v-if="loading" class="py-8 flex justify-center">
                    Loading...
                </div>
                <div v-else>
                    <!-- Controls -->
                    <div class="flex gap-2 mb-2 items-center">
                        <select
                            v-model="activeSesi"
                            class="text-xs border rounded px-2 py-1"
                        >
                            <option
                                v-for="s in [
                                    ...new Set(subjectList.map((x) => x.sesi)),
                                ]"
                                :key="s"
                                :value="s"
                            >
                                {{ s }}
                            </option>
                        </select>
                        <select
                            v-model.number="activeSemester"
                            class="text-xs border rounded px-2 py-1"
                        >
                            <option :value="1">Sem 1</option>
                            <option :value="2">Sem 2</option>
                        </select>
                        <div class="flex-1"></div>
                        <div class="flex gap-1">
                            <button
                                v-for="(d, idx) in days"
                                :key="d"
                                @click="selectedDay = idx"
                                :class="[
                                    'px-2 py-1 rounded text-xs',
                                    selectedDay === idx
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100',
                                ]"
                            >
                                {{ d.substring(0, 3) }}
                            </button>
                        </div>
                    </div>
                    <!-- Schedule -->
                    <div class="space-y-3 mt-2">
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
                                    <span v-if="item.room"
                                        >📍 {{ item.room }}</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div
                            v-if="daySchedule.length === 0"
                            class="text-center py-8 text-gray-400"
                        >
                            No classes scheduled for {{ days[selectedDay] }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
