<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

// Session Info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// Dummy clash data
const clashRooms = ref([
  {
    roomCode: "N28-105-01",
    roomName: "Bilik Kuliah 1",
    shortName: "BK1",
    faculty: "FSKSM / -",
    day: "Isnin",
    time: "07:00 AM – 07:50 AM",
    subject: "SEC1143 - 7 - seahcs"
  },
  {
    roomCode: "N28-105-01",
    roomName: "Bilik Kuliah 1",
    shortName: "BK1",
    faculty: "FSKSM / -",
    day: "Selasa",
    time: "11:00 AM – 11:50 AM",
    subject: "UHLM012 - 3 - -"
  },
  {
    roomCode: "N28-105-01",
    roomName: "Bilik Kuliah 1",
    shortName: "BK1",
    faculty: "FSKSM / -",
    day: "Selasa",
    time: "01:00 PM – 01:50 PM",
    subject: "SEC1143 - 3 - azlanmz"
  },
  {
    roomCode: "N28-105-01",
    roomName: "Bilik Kuliah 1",
    shortName: "BK1",
    faculty: "FSKSM / -",
    day: "Rabu",
    time: "03:00 PM – 03:50 PM",
    subject: "SCST1223 - 4 - izyanzzati"
  },
  // ... more rows
]);
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <!-- Header Banner -->
    <main>
      <div
        class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
        style="background-image: url('/backdropMain.jpg')"
      >
        <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
        <h2 class="text-2xl font-bold drop-shadow-md">Pertindihan Ruang & Masa</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
      </div>

      <!-- Clash Table -->
      <div class="overflow-x-auto px-4 py-4">
        <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
          <thead class="bg-[#b8d4ea]">
            <tr>
              <th class="border border-black px-2 py-1">Bil</th>
              <th class="border border-black px-2 py-1">Kod Ruang</th>
              <th class="border border-black px-2 py-1">Nama Ruang</th>
              <th class="border border-black px-2 py-1">Nama Singkatan</th>
              <th class="border border-black px-2 py-1">Kod Fakulti/Jabatan</th>
              <th class="border border-black px-2 py-1">Hari</th>
              <th class="border border-black px-2 py-1">Masa</th>
              <th class="border border-black px-2 py-1">Subjek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, index) in clashRooms" :key="index">
              <td class="border border-black px-2 py-1">{{ index + 1 }}</td>
              <td class="border border-black px-2 py-1 text-red-600 font-medium underline cursor-pointer">
                {{ room.roomCode }}
              </td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.roomName }}</td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.shortName }}</td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.faculty }}</td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.day }}</td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.time }}</td>
              <td class="border border-black px-2 py-1 text-red-600">{{ room.subject }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="text-sm flex justify-center py-4 space-x-2">
        <button>&lt;&lt;</button>
        <button class="font-bold underline">1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>&gt;&gt;</button>
      </div>
    </main>

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
