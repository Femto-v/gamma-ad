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

// Dummy curriculum data
const curricula = ref([
  {
    name: "Bachelor of Computer Science (Software Engineering)",
    sesi: "2020/2021", semester: 1, tahun: 1,
    teras: 1, elektif: 1, jumlah: 2
  },
  {
    name: "Bachelor of Computer Science (Bioinformatic)",
    sesi: "2017/2018", semester: 1, tahun: 1,
    teras: 32, elektif: 8, jumlah: 40
  },
  {
    name: "Bachelor of Computer Science (Computer Network and Security)",
    sesi: "2017/2018", semester: 1, tahun: 1,
    teras: 32, elektif: 1, jumlah: 43
  },
  {
    name: "Bachelor of Computer Science (Data Engineering)",
    sesi: "2017/2018", semester: 1, tahun: 1,
    teras: 34, elektif: 7, jumlah: 31
  },
  // Add more entries if needed
]);
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <!-- Banner -->
    <div
      class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
      style="background-image: url('/backdropMain.jpg')"
    >
      <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
      <h2 class="text-2xl font-bold drop-shadow-md">Kurikulum</h2>
      <p class="drop-shadow-md">{{ userInfo }}</p>
    </div>

    <!-- Curriculum Table -->
    <div class="overflow-x-auto px-4">
      <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
        <thead class="bg-[#b8d4ea]">
          <tr>
            <th class="border border-black px-2 py-1">Bil</th>
            <th class="border border-black px-2 py-1">Nama Kurikulum</th>
            <th class="border border-black px-2 py-1">Sesi</th>
            <th class="border border-black px-2 py-1">Semester</th>
            <th class="border border-black px-2 py-1">Tahun</th>
            <th class="border border-black px-2 py-1">Teras</th>
            <th class="border border-black px-2 py-1">Elektif</th>
            <th class="border border-black px-2 py-1">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in curricula" :key="index">
            <td class="border border-black px-2 py-1">{{ index + 1 }}</td>
            <td class="border border-black px-2 py-1">{{ item.name }}</td>
            <td class="border border-black px-2 py-1">{{ item.sesi }}</td>
            <td class="border border-black px-2 py-1">{{ item.semester }}</td>
            <td class="border border-black px-2 py-1">{{ item.tahun }}</td>
            <td class="border border-black px-2 py-1">{{ item.teras }}</td>
            <td class="border border-black px-2 py-1">{{ item.elektif }}</td>
            <td class="border border-black px-2 py-1">{{ item.jumlah }}</td>
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

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
