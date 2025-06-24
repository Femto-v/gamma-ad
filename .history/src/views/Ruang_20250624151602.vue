<script setup>
import {
    ref,
    watch,
    onMounted,
    onBeforeUnmount,
    computed,
    nextTick,
} from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import RuangApi from "@/api/RuangApi";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import Footer from "@/components/Footer.vue";
import RuangTimetablePanel from "./RuangTimetablePanel.vue";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const ruangApi = new RuangApi();
const selectedFaculty = ref("FSKSM");
const rooms = ref([]);
const error = ref(null);
const searchTerm = ref("");
const loadCount = ref(6);
const loadingMore = ref(false);
const selectedRoomCode = ref(null);

const formatRoomData = (room) => ({
    code: room.kod_ruang,
    name: room.nama_ruang,
    shortName: room.nama_ruang_singkatan,
    faculty: `${room.kod_fakulti} / ${room.kod_jabatan}`,
    type: room.jenis,
    capacity: room.kapasiti,
});

const fetchRooms = async () => {
    try {
        error.value = null;
        loadCount.value = 6;
        const data = await ruangApi.getRoomsByFaculty(selectedFaculty.value);
        rooms.value = Array.isArray(data)
            ? data.map(formatRoomData)
            : [formatRoomData(data)];
        nextTick(() => {
            const scroller = document.getElementById("ruang-scroll-list");
            if (scroller && !scroller._listenerAdded) {
                scroller.addEventListener("scroll", handleScroll);
                scroller._listenerAdded = true;
            }
            if (scroller) scroller.scrollTop = 0;
        });
    } catch (err) {
        error.value = "Gagal memuatkan data ruang.";
        rooms.value = [];
    }
};

watch(selectedFaculty, fetchRooms);

const filteredRooms = computed(() => {
    const q = searchTerm.value.trim().toLowerCase();
    if (!q) return rooms.value;
    return rooms.value.filter(
        (room) =>
            room.code?.toLowerCase().includes(q) ||
            room.name?.toLowerCase().includes(q) ||
            room.shortName?.toLowerCase().includes(q) ||
            room.faculty?.toLowerCase().includes(q) ||
            room.type?.toLowerCase().includes(q)
    );
});

const visibleRooms = computed(() =>
    filteredRooms.value.slice(0, loadCount.value)
);

function handleScroll() {
    const scroller = document.getElementById("ruang-scroll-list");
    if (!scroller) return;
    if (
        scroller.scrollTop + scroller.clientHeight >=
            scroller.scrollHeight - 50 &&
        !loadingMore.value
    ) {
        if (loadCount.value < filteredRooms.value.length) {
            loadingMore.value = true;
            setTimeout(() => {
                loadCount.value += 10;
                loadingMore.value = false;
            }, 250);
        }
    }
}

watch([searchTerm, rooms], () => {
    loadCount.value = 6;
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    });
});

onMounted(fetchRooms);

function handleWindowScroll() {
    const nearBottom = 100;
    if (
        window.innerHeight + window.scrollY >=
            document.body.offsetHeight - nearBottom &&
        !loadingMore.value
    ) {
        if (loadCount.value < filteredRooms.value.length) {
            loadingMore.value = true;
            setTimeout(() => {
                loadCount.value += 6;
                loadingMore.value = false;
            }, 250);
        }
    }
}

onMounted(() => {
    fetchRooms();
    window.addEventListener("scroll", handleWindowScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleWindowScroll);
});
</script>

<template>
    <div
        class="bg-gradient-to-tr from-blue-50 via-white to-blue-100 min-h-screen flex flex-col"
    >
        <Toggle />
        <main class="flex-1 pb-8">
            <ProfileBanner titleBanner="🏟️ Daftar Venue / Ruang" />

            <!-- Container -->
            <section
                class="w-full max-w-2xl mx-auto mt-4 rounded-2xl bg-white/70 shadow-xl border border-blue-100 p-6 mb-8"
            >
                <!-- Search & Faculty Filters -->
                <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
                >
                    <!-- Search Bar -->
                    <div class="flex-1">
                        <label class="sr-only" for="searchVenue"
                            >Cari Venue</label
                        >
                        <div class="relative">
                            <input
                                v-model="searchTerm"
                                id="searchVenue"
                                type="text"
                                placeholder="🔍 Cari venue, kode, jenis, fakultas..."
                                class="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-blue-200 bg-white shadow focus:ring-2 focus:ring-blue-300 outline-none text-base transition"
                            />
                            <span
                                class="absolute left-3 top-2.5 text-blue-400 text-lg pointer-events-none"
                                >🔍</span
                            >
                        </div>
                    </div>
                    <!-- Fakulti Dropdown -->
                    <div class="flex items-center gap-2">
                        <span class="text-blue-700 text-base font-medium"
                            >🏫 Fakultas:</span
                        >
                        <select
                            v-model="selectedFaculty"
                            class="border-2 border-blue-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-300 transition"
                        >
                            <option value="FSKSM">FSKSM</option>
                            <option value="FKE">FKE</option>
                            <option value="FABU">FABU</option>
                        </select>
                    </div>
                </div>

                <!-- Room Cards -->
                <div
                    id="ruang-scroll-list"
                    class="flex flex-col gap-6 py-2 overflow-y-auto max-h-[75vh] min-h-[30vh]"
                >
                    <template v-if="visibleRooms.length">
                        <div
                            v-for="(room, index) in visibleRooms"
                            :key="index"
                            class="rounded-2xl shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 relative group transition-all hover:shadow-blue-300/40 hover:-translate-y-1 hover:scale-[1.01] duration-200 flex flex-col gap-2"
                        >
                            <!-- Header: Code and Info Button -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="text-blue-700 font-bold text-xl tracking-widest flex items-center gap-1"
                                    >
                                        🏢 {{ room.code }}
                                    </span>
                                </div>
                                <button
                                    class="flex gap-2 rounded-full bg-blue-50 border border-blue-200 p-2 shadow hover:bg-blue-200 hover:shadow-lg hover:scale-110 active:bg-blue-300 text-blue-600 transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                    title="Lihat Maklumat Jadual"
                                    @click="selectedRoomCode = room.code"
                                >
                                    <span class="sr-only">Maklumat Jadual</span>
                                    <span>Timetable</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <rect
                                            x="6"
                                            y="3"
                                            width="12"
                                            height="18"
                                            rx="2"
                                            stroke-width="2"
                                        />
                                        <path
                                            d="M9 7h6M9 11h6M9 15h3"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <!-- Room Name and Short Name -->
                            <div
                                class="mt-2 mb-1 text-lg font-semibold text-gray-800 flex items-center gap-2"
                            >
                                <span>🏷️</span>
                                <span>{{ room.name }}</span>
                                <span
                                    v-if="
                                        room.shortName &&
                                        room.shortName !== room.name
                                    "
                                    class="ml-1 text-xs text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full"
                                >
                                    ({{ room.shortName }})
                                </span>
                            </div>

                            <!-- Divider -->
                            <div class="my-2 border-t border-blue-100"></div>

                            <!-- Room Details -->
                            <div
                                class="flex flex-wrap gap-3 mt-1 text-sm font-medium"
                            >
                                <span
                                    class="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1"
                                >
                                    🏫 {{ room.faculty }}
                                </span>
                                <span
                                    class="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1"
                                >
                                    🏷️ {{ room.type }}
                                </span>
                                <span
                                    class="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full px-3 py-1"
                                >
                                    👥 {{ room.capacity }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <div
                        v-else-if="!loadingMore && !error"
                        class="py-10 text-center text-blue-300 text-base"
                    >
                        <span class="text-3xl">🙈</span><br />
                        Tidak ada venue ditemukan.
                    </div>
                    <div
                        v-if="loadingMore"
                        class="py-2 text-center text-blue-400 text-base animate-pulse"
                    >
                        ⏳ Loading more...
                    </div>
                    <div
                        v-if="error"
                        class="py-10 text-center text-red-500 text-base"
                    >
                        <span class="text-2xl">⚠️</span><br />
                        {{ error }}
                    </div>
                </div>
            </section>
        </main>

        <!-- Timetable Panel -->
        <RuangTimetablePanel
            v-if="selectedRoomCode"
            :roomCode="selectedRoomCode"
            :show="!!selectedRoomCode"
            :onClose="() => (selectedRoomCode = null)"
        />

        <Footer class="mt-8 opacity-80" />
    </div>
</template>
