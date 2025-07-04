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
    "from-violet-200 to-violet-100 border-violet-300",
    "from-sky-200 to-blue-100 border-blue-300",
    "from-pink-200 to-rose-100 border-pink-300",
    "from-amber-200 to-orange-100 border-amber-300",
    "from-green-200 to-lime-100 border-green-300",
    "from-yellow-200 to-yellow-100 border-yellow-300",
    "from-indigo-200 to-indigo-100 border-indigo-300",
    "from-red-200 to-orange-100 border-red-300",
];

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

const mergedDaySchedule = computed(() => {
  if (!daySchedule.value.length) return [];

  const merged = [];
  let prev = null;

  daySchedule.value.forEach((item) => {
    if (
      prev &&
      prev.subject === item.subject &&
      prev.section === item.section &&
      prev.room === item.room
    ) {
      // Extend previous block's end time
      prev.endTime = item.time.split("-")[1].trim();
    } else {
      // Push new block
      if (prev) merged.push(prev);
      prev = {
        ...item,
        startTime: item.time.split("-")[0].trim(),
        endTime: item.time.split("-")[1].trim(),
      };
    }
  });

  // Push the last block
  if (prev) merged.push(prev);

  return merged;
});
</script>

<template>
    <div
        class="fixed inset-0 bg-gradient-to-br from-blue-200/50 via-white/80 to-pink-100/60 z-50 flex items-center justify-center backdrop-blur-sm"
    >
        <div
            class="bg-white/90 rounded-3xl shadow-2xl max-w-xl w-full mx-4 overflow-auto max-h-[92vh] px-7 py-7 relative border-2 border-blue-100 ring-1 ring-blue-100"
        >
            <!-- Close button -->
            <button
                class="absolute right-7 top-5 text-2xl font-extrabold text-gray-400 hover:text-red-400 transition"
                @click="props.onClose"
                title="Close"
            >
                &times;
            </button>
            <h3
                class="text-2xl font-extrabold text-blue-900 mb-1 flex items-center gap-2 tracking-tight"
            >
                <span class="text-3xl">📅</span> Lecturer Timetable
                <span class="text-xs text-blue-400 ml-2 font-mono"
                    >({{ props.lecturer.name }})</span
                >
            </h3>
            <!-- Controls for sesi/semester -->
            <div
                class="flex flex-wrap gap-3 mb-4 mt-3 items-center justify-between"
            >
                <div class="flex items-center gap-2">
                    <select
                        v-model="sesi"
                        class="text-xs border-2 border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 font-bold shadow-sm focus:ring-2 focus:ring-blue-200 transition"
                    >
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
                        class="text-xs border-2 border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 font-bold shadow-sm focus:ring-2 focus:ring-blue-200 transition"
                    >
                        <option :value="1">Semester 1</option>
                        <option :value="2">Semester 2</option>
                    </select>
                </div>
                <div class="flex flex-row gap-1 flex-wrap">
                    <button
                        v-for="(day, idx) in days"
                        :key="day"
                        @click="selectedDay = idx"
                        :class="[
                            'px-3 py-1 rounded-xl font-semibold transition border',
                            selectedDay === idx
                                ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white border-blue-600 shadow-md scale-105'
                                : 'bg-blue-50 border-blue-100 text-blue-500 hover:bg-blue-100',
                        ]"
                    >
                        {{ day }}
                    </button>
                </div>
            </div>
            <!-- Day Schedule -->
            <div class="space-y-4 mt-1">
                <div
                    v-for="(item, index) in mergedDaySchedule"
                    :key="index"
                    class="flex gap-3 items-center p-4 rounded-2xl border-2 shadow-xl bg-gradient-to-br"
                    :class="item.color"
                    style="background-blend-mode: lighten"
                >
                    <!-- Time Column -->
                    <div
                        class="flex flex-col items-center min-w-[64px] py-1 px-1 bg-white/70 rounded-xl border-2 border-blue-200 shadow-md mr-1"
                    >
                        <span
                            class="font-black text-base text-blue-800 tracking-tight leading-none"
                        >
                            {{ item.startTime }}
                        </span>
                        <span class="text-xs text-blue-400 font-mono">
                            {{ item.endTime }}
                        </span>
                    </div>
                    <!-- Main Info -->
                    <div class="flex-1 flex flex-col gap-1">
                        <span
                            class="inline-block rounded-lg border px-2 py-0.5 font-mono font-bold text-sm mb-0.5 tracking-wide shadow-sm"
                            :class="item.color"
                        >
                            {{ item.subject }}
                        </span>
                        <span
                            class="block text-base font-semibold text-blue-800 truncate leading-tight"
                        >
                            {{ item.subjectName }}
                        </span>
                        <div class="flex flex-wrap gap-2 text-sm mt-1">
                            <span
                                class="bg-white/60 rounded-lg px-2 py-0.5 border border-blue-200 font-semibold text-blue-700"
                            >
                                Section: <b>{{ item.section }}</b>
                            </span>
                            <span
                                v-if="item.room"
                                class="bg-white/60 rounded-lg px-2 py-0.5 border border-pink-200 font-semibold text-pink-700"
                                >📍 {{ item.room }}</span
                            >
                        </div>
                    </div>
                </div>
                <div
                    v-if="daySchedule.length === 0"
                    class="text-center py-16 text-blue-300 font-bold text-lg"
                >
                    <span class="text-2xl">💤</span><br />
                    No classes scheduled for {{ days[selectedDay] }}
                </div>
            </div>
        </div>
    </div>
</template>
