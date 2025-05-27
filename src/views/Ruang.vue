<script setup>
import { ref, watch, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import RuangApi from "@/api/RuangApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

// Load session info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// API and reactive data
const ruangApi = new RuangApi();
const selectedFaculty = ref("FSKSM");
const rooms = ref([]);
const error = ref(null);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

// Format for table
const formatRoomData = (room) => ({
    code: room.kod_ruang,
    name: room.nama_ruang,
    shortName: room.nama_ruang_singkatan,
    faculty: `${room.kod_fakulti} / ${room.kod_jabatan}`,
    type: room.jenis,
    capacity: room.kapasiti,
});

// Fetch from API
const fetchRooms = async () => {
    try {
        error.value = null;
        currentPage.value = 1; // reset page on new fetch
        const data = await ruangApi.getRoomsByFaculty(selectedFaculty.value);
        rooms.value = Array.isArray(data) ? data.map(formatRoomData) : [formatRoomData(data)];
    } catch (err) {
        error.value = "Gagal memuatkan data ruang.";
        rooms.value = [];
    }
};

// Watch for faculty change
watch(selectedFaculty, fetchRooms);

// On page load
onMounted(fetchRooms);

// Pagination logic
const totalPages = computed(() => Math.ceil(rooms.value.length / itemsPerPage));

const paginatedRooms = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return rooms.value.slice(start, start + itemsPerPage);
});

const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <main>
      <ProfileBanner titleBanner="Ruang" />

      <div v-if="error" class="text-red-600 text-center mt-2 text-sm">
        {{ error }}
      </div>

      <!-- CARD LIST SECTION -->
      <div class="flex flex-col gap-4 px-4 py-4 max-w-lg mx-auto">
        <div
          v-for="(room, index) in paginatedRooms"
          :key="index"
          class="bg-blue-100 rounded-xl shadow flex flex-col relative p-4"
        >
          <!-- Header (code + action button) -->
          <div class="flex justify-between items-start">
            <div>
              <div class="font-semibold text-lg">{{ room.code }}</div>
            </div>
            <button
              class="rounded bg-gray-200 hover:bg-gray-300 p-2"
              title="Maklumat Jadual"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2"/>
                <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Room Name (with shortName if available) -->
          <div class="mt-1 mb-1 font-medium">
            {{ room.name }}
            <span v-if="room.shortName && room.shortName !== room.name" class="text-sm text-gray-500">
              ({{ room.shortName }})
            </span>
          </div>

          <!-- Bottom Info Row -->
          <div class="flex justify-between items-center mt-3 text-[15px]">
            <div class="text-gray-700">
              {{ room.faculty }}
            </div>
            <div class="text-gray-700">{{ room.type }}</div>
            <div class="flex items-center gap-1 text-gray-700">
              <!-- Capacity icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M17 20H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2Z"/>
                <circle cx="12" cy="7" r="3"/>
              </svg>
              {{ room.capacity }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Dropdown + Pagination (as before, not changed) -->
    <div class="flex flex-col items-center gap-2 py-4 text-sm">
      <label>
        Fakulti:
        <select v-model="selectedFaculty" class="border px-2 py-1 rounded ml-2">
          <option value="FSKSM">FSKSM</option>
          <option value="FKE">FKE</option>
          <option value="FABU">FABU</option>
        </select>
      </label>

      <!-- Pagination Buttons with Dropdown -->
      <div class="flex justify-center gap-2 text-base items-center">
        <button @click="setPage(1)" :disabled="currentPage === 1">&lt;&lt;</button>
        <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1">&lt;</button>
        <span>
          Page
          <select
            v-model="currentPage"
            @change="setPage(Number(currentPage))"
            class="mx-1 px-2 py-1 border rounded"
          >
            <option v-for="page in totalPages" :key="page" :value="page">
              {{ page }}
            </option>
          </select>
          of {{ totalPages }}
        </span>
        <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages">&gt;</button>
        <button @click="setPage(totalPages)" :disabled="currentPage === totalPages">&gt;&gt;</button>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
