<script setup>
import { ref, watch, computed, onMounted } from "vue";
import JadualRuangApi from "@/api/JadualRuangApi";
import JadualSubjekApi from "@/api/JadualSubjekApi";
import { days, timetable } from "@/constants/TimetableConstants";
import { currentSemester, currentSession } from "@/constants/ApiConstants";

const props = defineProps({
    roomCode: String,
    show: Boolean,
    onClose: Function,
});

const sesiOptions = ["2024/2025", "2023/2024"];
const selectedSesi = ref("2024/2025");
const selectedSemester = ref(1);
const selectedDay = ref(0);
const selectedFilter = ref(1);
const selectedDate = ref('null');

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
watch([selectedSesi, selectedSemester, selectedFilter,() => props.roomCode], fetchTimetable);

const filteredEntries = computed(() => {
  const chosenDate = selectedDate.value;

  if (selectedFilter.value === 1) {
    return entries.value
      .filter((e) => {
        if (chosenDate) {
          // If date selected, show event if tarikh_mula equals chosenDate
          return e.subjek === null && e.tarikh_mula === chosenDate;
        } else {
          // Otherwise, show by day
          return e.hari === selectedDay.value + 1 && e.subjek === null;
        }
      })
      .map((e) => ({
        kod_perkara: e.kod_perkara ?? "-",
        section: e.subjek?.seksyen ?? "-",
        room: props.roomCode,
        time: getTime(e.masa),
      }))
      .filter((e) => e.time);
  } else if (selectedFilter.value === 2) {
    return entries.value
      .filter((e) => e.hari === selectedDay.value + 1)
      .map((e) => ({
        subject: e.subjek?.kod_subjek ?? "-",
        section: e.subjek?.seksyen ?? "-",
        room: props.roomCode,
        time: getTime(e.masa),
      }))
      .filter((e) => e.time);
  } else {
    return [];
  }
});

function getTime(masa) {
    const row = timetable.find((t) => t.masa === masa);
    return row ? row.waktu : "";
}

const mergedDaySchedule = computed(() => {
  if (!filteredEntries.value.length) return [];

  const merged = [];
  let prev = null;

  filteredEntries.value.forEach((item) => {
    if (selectedFilter.value === 1) {
      // Event merging logic: merge same kod_perkara
      if (prev && prev.kod_perkara === item.kod_perkara) {
        prev.endTime = item.time.split("-")[1].trim();
      } else {
        if (prev) merged.push(prev);
        prev = {
          ...item,
          startTime: item.time.split("-")[0].trim(),
          endTime: item.time.split("-")[1].trim(),
        };
      }
    } else if (selectedFilter.value === 2) {
      // Subject merging logic
      if (
        prev &&
        prev.subject === item.subject &&
        prev.section === item.section
      ) {
        prev.endTime = item.time.split("-")[1].trim();
      } else {
        if (prev) merged.push(prev);
        prev = {
          ...item,
          startTime: item.time.split("-")[0].trim(),
          endTime: item.time.split("-")[1].trim(),
        };
      }
    }
  });
  if (prev) merged.push(prev);
  return merged;
});

function onDateChange() {
  console.log("Selected date:", selectedDate.value);
  if (selectedDate.value) {
    const dateObj = new Date(selectedDate.value);
    const dayIndex = dateObj.getDay();
    selectedDay.value = dayIndex;
    console.log("Updated selectedDay:", dayIndex);
  }
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
                class="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2 justify-center"
            >
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timetable &mdash; <span class="text-blue-600 font-mono">{{ roomCode }}</span>
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
                
                <select
                    v-model="selectedFilter"
                    class="border-2 border-blue-200 bg-white/80 rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200 transition"
                >
                    <option :value="1">Event</option>
                    <option :value="2">Daily</option>
                </select>

                <div class="border-2 border-blue-200 bg-white/80 rounded-xl px-3 py-2 text-sm font-semibold shadow focus:border-blue-400 focus:ring-blue-200">
                  <label for="date">Select Date: </label>
                  <input class="ml-2" type="date" id="date" v-model="selectedDate" @change="onDateChange" />
                </div>

                <div class="flex gap-1">
                    <button
                        v-for="(d, i) in days"
                        :key="i"
                        :class="[
                            'px-2 py-1 rounded-xl text-sm font-semibold border transition-all duration-200',
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
            <div v-if="mergedDaySchedule.length" class="space-y-3">
                <div
                    v-for="(entry, i) in mergedDaySchedule"
                    :key="i"
                    class="bg-gradient-to-br from-purple-100 via-white to-pink-50 border-2 border-purple-200 p-4 rounded-2xl shadow-md flex flex-col gap-1 animate-timetable-card"
                >
                    <div v-if="selectedFilter === 1">
                        <div class="flex items-center gap-2 mb-1">
                            <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span class="font-bold text-gray-900 text-sm">{{ entry.kod_perkara }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{{ entry.startTime }} &ndash; {{ entry.endTime }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Section: <b>{{ entry.section || "—" }}</b></span>
                        </div>
                    </div>

                    <div v-else-if="selectedFilter === 2">
                        <div class="flex items-center gap-2 mb-1">
                            <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span class="font-bold text-gray-900 text-sm">{{ entry.subject }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{{ entry.startTime }} &ndash; {{ entry.endTime }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Section: <b>{{ entry.section || "—" }}</b></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div
                v-else
                class="text-center text-blue-300 py-8 font-semibold text-lg"
            >
                <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                No schedule for today.
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
