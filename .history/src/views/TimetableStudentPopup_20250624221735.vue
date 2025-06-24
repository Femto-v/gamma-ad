<script setup>
import { ref, computed, onMounted, watch } from "vue";
import PelajarSubjekApi from "@/api/PelajarSubjekApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import { timetable, days } from "@/constants/TimetableConstants";

const props = defineProps({
    matric: { type: String, required: true },
    show: { type: Boolean, required: true },
    onClose: { type: Function, required: true },
});

const subjectList = ref([]);
const timetableData = ref(JSON.parse(JSON.stringify(timetable)));
const activeSesi = ref("2024/2025");
const activeSemester = ref(1);
const selectedDay = ref(new Date().getDay());
const loading = ref(false);

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
            class="fixed inset-0 bg-gradient-to-br from-blue-200/50 via-white/80 to-pink-100/60 z-50 flex items-center justify-center backdrop-blur-sm"
        >
            <div
                class="bg-white/90 rounded-3xl shadow-2xl max-w-xl w-full mx-4 overflow-auto max-h-[92vh] px-7 py-7 relative border-2 border-blue-100 ring-1 ring-blue-100"
            >
                <!-- Close button -->
                <button
                    @click="onClose"
                    class="absolute top-5 right-7 text-gray-400 hover:text-red-400 text-2xl font-extrabold transition"
                    title="Close"
                >
                    &times;
                </button>
                <h3
                    class="text-2xl font-extrabold text-blue-900 mb-1 flex items-center gap-2 tracking-tight"
                >
                    <span class="text-3xl">📅</span> Student Timetable
                    <span class="text-xs text-blue-400 ml-2 font-mono"
                        >({{ matric }})</span
                    >
                </h3>
                <!-- Controls -->
                <div
                    class="flex flex-wrap gap-3 mb-4 mt-3 items-center justify-between"
                >
                    <div class="flex items-center gap-2">
                        <select
                            v-model="activeSesi"
                            class="text-xs border-2 border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 font-bold shadow-sm focus:ring-2 focus:ring-blue-200 transition"
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
                            class="text-xs border-2 border-blue-200 bg-blue-50/50 rounded-xl px-3 py-2 font-bold shadow-sm focus:ring-2 focus:ring-blue-200 transition"
                        >
                            <option :value="1">Semester 1</option>
                            <option :value="2">Semester 2</option>
                        </select>
                    </div>
                    <div class="flex flex-row gap-1 flex-wrap">
                        <button
                            v-for="(d, idx) in days"
                            :key="d"
                            @click="selectedDay = idx"
                            :class="[
                                'px-3 py-1 rounded-xl font-semibold transition border',
                                selectedDay === idx
                                    ? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 text-white border-blue-600 shadow-md scale-105'
                                    : 'bg-blue-50 border-blue-100 text-blue-500 hover:bg-blue-100',
                            ]"
                        >
                            {{ d }}
                        </button>
                    </div>
                </div>
                <!-- Loading -->
                <div
                    v-if="loading"
                    class="py-20 flex justify-center items-center"
                >
                    <svg
                        class="animate-spin h-10 w-10 text-blue-400"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        />
                    </svg>
                </div>
                <!-- Day Schedule -->
                <div v-else class="space-y-4 mt-1">
                    <div
                        v-for="(item, index) in daySchedule"
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
                                {{ item.time.split("-")[0] }}
                            </span>
                            <span class="text-xs text-blue-400 font-mono">
                                {{ item.time.split("-")[1] }}
                            </span>
                        </div>
                        <!-- Main Info -->
                        <div class="gap-1">
                            <span
                                class="inline-block rounded-lg border px-2 py-0.5 font-mono font-bold text-sm mb-0.5 shadow-sm"
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
                                    >Section: <b>{{ item.section }}</b></span
                                >
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
