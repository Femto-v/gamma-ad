<script setup>
import { ref, watch, computed, onMounted } from "vue";
import JadualRuangApi from "@/api/JadualRuangApi";
import { days, timetable } from "@/constants/TimetableConstants";

const props = defineProps({
    roomCode: String,
    show: Boolean,
    onClose: Function,
});

const sesiOptions = ["2024/2025", "2023/2024"];
const selectedSesi = ref("2024/2025");
const selectedSemester = ref(1);
const selectedDay = ref(0);

const entries = ref([]);
const jadualRuangApi = new JadualRuangApi();

async function fetchTimetable() {
    if (!props.roomCode) return;
    try {
        const data = await jadualRuangApi.fetchByRoom(
            selectedSesi.value,
            selectedSemester.value,
            props.roomCode
        );
        entries.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Failed to fetch timetable:", err);
        entries.value = [];
    }
}

onMounted(fetchTimetable);
watch([selectedSesi, selectedSemester, () => props.roomCode], fetchTimetable);

const filteredEntries = computed(() =>
    entries.value.filter((e) => e.hari === selectedDay.value + 1)
);

function getTime(masa) {
    const row = timetable.find((t) => t.masa === masa);
    return row ? row.waktu : "";
}
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-gradient-to-br from-blue-100/70 via-pink-100/60 to-yellow-100/50 backdrop-blur-sm z-50 flex justify-center items-center px-2"
    >
        <div
            class="bg-white/90 max-w-lg w-full mx-0 sm:mx-4 rounded-3xl shadow-2xl border-2 border-blue-100 max-h-[90vh] overflow-y-auto relative p-5 glassy"
        >
            <!-- Close Button -->
            <button
                @click="onClose"
                class="absolute top-4 right-4 text-2xl text-blue-400 hover:text-pink-500 bg-white/70 rounded-full p-2 shadow transition"
                aria-label="Tutup"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            <!-- Panel Header -->
            <h2
                class="text-2xl font-extrabold mb-4 text-blue-900 flex items-center gap-2 justify-center"
            >
                <span class="text-2xl">🏛️</span> Timetable
                <span class="text-pink-500">{{ roomCode }}</span>
            </h2>

            <!-- Filter Controls -->
            <div class="flex flex-wrap gap-2 mb-5 justify-center">
                <select
                    v-model="selectedSesi"
                    class="border-2 border-blue-200 bg-white/80 rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200 transition"
                >
                    <option v-for="s in sesiOptions" :key="s" :value="s">
                        {{ s }}
                    </option>
                </select>

                <select
                    v-model="selectedSemester"
                    class="border-2 border-blue-200 bg-white/80 rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200 transition"
                >
                    <option :value="1">Sem 1</option>
                    <option :value="2">Sem 2</option>
                </select>

                <div class="flex gap-1">
                    <button
                        v-for="(d, i) in days"
                        :key="i"
                        :class="[
                            'px-3 py-1 rounded-xl text-sm font-semibold border transition-all duration-200',
                            selectedDay === i
                                ? 'bg-blue-500 text-white border-blue-400 shadow'
                                : 'bg-white border-blue-100 text-blue-800 hover:bg-blue-50',
                        ]"
                        @click="selectedDay = i"
                    >
                        <span class="text-base">{{ d.slice(0, 3) }}</span>
                    </button>
                </div>
            </div>

            <!-- Timetable List -->
            <div v-if="filteredEntries.length" class="space-y-3">
                <div
                    v-for="(entry, i) in filteredEntries"
                    :key="i"
                    class="bg-gradient-to-br from-purple-100 via-white to-pink-50 border-2 border-purple-200 p-4 rounded-2xl shadow-md flex flex-col gap-1 animate-timetable-card"
                >
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xl">📚</span>
                        <span class="font-bold text-blue-900 text-base">{{
                            entry.kod_perkara
                        }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-blue-800">
                        <span class="text-lg">🕑</span>
                        <span>{{ getTime(entry.masa) }}</span>
                    </div>
                    <div
                        class="flex items-center gap-2 text-sm text-pink-700 mt-1"
                    >
                        <span class="text-lg">🔖</span>
                        <span
                            >Section: <b>{{ entry.section || "-" }}</b></span
                        >
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else
                class="text-center text-blue-300 py-8 font-semibold text-lg"
            >
                <span class="text-3xl">😴</span><br />
                No Schedule for today.
            </div>
        </div>
    </div>
</template>

<style scoped>
.glassy {
    backdrop-filter: blur(5px);
}
@media (max-width: 520px) {
    .glassy {
        padding-left: 6px !important;
        padding-right: 6px !important;
    }
}
.animate-timetable-card {
    animation: fadeInCard 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fadeInCard {
    from {
        opacity: 0;
        transform: translateY(24px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: none;
    }
}
</style>
