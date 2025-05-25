<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Sample room data
const rooms = ref([
  {
    code: "N28A-04-17",
    name: "ALiAS",
    shortName: "ALiAS",
    faculty: "FSKSM / -",
    type: "Makmal",
    capacity: 29,
  },
  {
    code: "N28A-04-19",
    name: "Artificial Intelligence & Bioinformatics Group Lab",
    shortName: "AIBG lab",
    faculty: "FSKSM / -",
    type: "Makmal",
    capacity: 13,
  },
  {
    code: "N28-116-02",
    name: "Bilik Kuliah 2",
    shortName: "BK2",
    faculty: "FSKSM / -",
    type: "Bilik Kuliah",
    capacity: 120,
  },
  // ... more rows
])

const selectedFaculty = ref("FSKSM")
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <!-- Main Content -->
    <main>
        <div 
            class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
            style="background-image: url('/backdropMain.jpg')"
        >
            <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
            <h2 class="text-2xl font-bold drop-shadow-md">Ruang</h2>
            <p class="drop-shadow-md">{{ userInfo }}</p>
        </div>

    <!-- Table Section -->
    <div class="overflow-x-auto px-4 py-4">
      <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
        <thead class="bg-[#b8d4ea]">
          <tr>
            <th class="border border-black px-2 py-1">Bil</th>
            <th class="border border-black px-2 py-1">Kod Ruang</th>
            <th class="border border-black px-2 py-1">Nama Ruang</th>
            <th class="border border-black px-2 py-1">Nama Singkatan</th>
            <th class="border border-black px-2 py-1">Fakulti/Jabatan</th>
            <th class="border border-black px-2 py-1">Jenis</th>
            <th class="border border-black px-2 py-1">Kapasiti</th>
            <th class="border border-black px-2 py-1">Maklumat Jadual</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(room, index) in rooms" :key="index">
            <td class="border border-black px-2 py-1">{{ index + 1 }}</td>
            <td class="border border-black px-2 py-1">{{ room.code }}</td>
            <td class="border border-black px-2 py-1">{{ room.name }}</td>
            <td class="border border-black px-2 py-1">{{ room.shortName }}</td>
            <td class="border border-black px-2 py-1">{{ room.faculty }}</td>
            <td class="border border-black px-2 py-1">{{ room.type }}</td>
            <td class="border border-black px-2 py-1">{{ room.capacity }}</td>
            <td class="border border-black px-2 py-1">
              <button class="mr-2 text-blue-600 hover:text-blue-900">
                📄
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </main>

    <!-- Dropdown + Pagination -->
    <div class="flex flex-col items-center gap-2 py-4 text-sm">
      <label>
        Fakulti:
        <select v-model="selectedFaculty" class="border px-2 py-1 rounded ml-2">
          <option value="FSKSM">FSKSM</option>
          <option value="FKE">FKE</option>
          <option value="FABU">FABU</option>
        </select>
      </label>

      <div class="space-x-2 mt-2">
        <button>&lt;&lt;</button>
        <button class="font-bold underline">1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>&gt;&gt;</button>
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
