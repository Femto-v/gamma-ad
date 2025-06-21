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
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import Footer from "@/components/Footer.vue";
import RuangTimetablePanel from "@/components/RuangTimetablePanel.vue";

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
const loadCount = ref(3);
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
        loadCount.value = 3;
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
                loadCount.value += 20;
                loadingMore.value = false;
            }, 250);
        }
    }
}

watch([searchTerm, rooms], () => {
    loadCount.value = 3;
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
                loadCount.value += 3;
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
    <div class="bg-gray-100 min-h-screen">
        <Toggle />
        <main>
            <ProfileBanner titleBanner="Venue" />

            <div class="flex flex-col items-center">
                <!-- Search Bar -->
                <div class="w-full max-w-lg relative px-4 mb-4">
                    <div
                        class="flex items-center bg-white rounded-2xl shadow px-4 py-2 border border-gray-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5 mr-2 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="8"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                            />
                            <line
                                x1="21"
                                y1="21"
                                x2="16.65"
                                y2="16.65"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                            />
                        </svg>
                        <input
                            v-model="searchTerm"
                            type="text"
                            placeholder="Search"
                            class="w-full outline-none border-0 bg-transparent text-base"
                        />
                    </div>
                </div>
            </div>

            <!-- Fakulti Dropdown -->
            <div class="flex flex-col items-center gap-2 py-4 text-sm">
                <label>
                    Faculty:
                    <select
                        v-model="selectedFaculty"
                        class="border px-2 py-1 rounded ml-2"
                    >
                        <option value="FSKSM">FSKSM</option>
                        <option value="FKE">FKE</option>
                        <option value="FABU">FABU</option>
                    </select>
                </label>
            </div>

            <!-- Room Cards -->
            <div class="flex flex-col items-center">
                <div
                    id="ruang-scroll-list"
                    class="flex flex-col gap-4 px-4 py-2 max-w-lg w-full mx-auto overflow-y-auto"
                >
                    <div
                        v-for="(room, index) in visibleRooms"
                        :key="index"
                        class="bg-blue-100 rounded-xl shadow flex flex-col relative p-4"
                    >
                        <!-- Header (code + action button) -->
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-semibold text-lg">
                                    {{ room.code }}
                                </div>
                            </div>
                            <button
                                class="rounded bg-gray-200 hover:bg-gray-300 p-2"
                                title="Maklumat Jadual"
                                @click="selectedRoomCode = room.code"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-6 h-6 text-gray-600"
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

                        <!-- Room Name -->
                        <div class="mt-1 mb-1 font-medium">
                            {{ room.name }}
                            <span
                                v-if="
                                    room.shortName &&
                                    room.shortName !== room.name
                                "
                                class="text-sm text-gray-500"
                            >
                                ({{ room.shortName }})
                            </span>
                        </div>

                        <!-- Bottom Info -->
                        <div
                            class="flex justify-between items-center mt-3 text-[15px] flex-wrap"
                        >
                            <div class="text-gray-700">{{ room.faculty }}</div>
                            <div class="text-gray-700">{{ room.type }}</div>
                            <div class="flex items-center gap-1 text-gray-700">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-5 h-5 inline"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        d="M17 20H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2Z"
                                    />
                                    <circle cx="12" cy="7" r="3" />
                                </svg>
                                {{ room.capacity }}
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="loadingMore"
                        class="py-2 text-center text-gray-400 text-sm"
                    >
                        Loading more...
                    </div>
                    <div
                        v-if="!visibleRooms.length && !error"
                        class="py-10 text-center text-gray-400 text-base"
                    >
                        No Room Found.
                    </div>
                    <div
                        v-if="error"
                        class="py-10 text-center text-red-500 text-base"
                    >
                        {{ error }}
                    </div>
                </div>
            </div>
        </main>

        <!-- Timetable Panel -->
        <RuangTimetablePanel
            v-if="selectedRoomCode"
            :roomCode="selectedRoomCode"
            :show="!!selectedRoomCode"
            :onClose="() => (selectedRoomCode = null)"
        />

        <Footer />
    </div>
</template>
