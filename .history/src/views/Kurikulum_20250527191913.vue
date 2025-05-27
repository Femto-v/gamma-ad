<script setup>
import { ref } from "vue";
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
    sesi: "2020/2021",
    semester: 1,
    tahun: 1,
    teras: 1,
    elektif: 1,
    jumlah: 2,
  },
  {
    name: "Bachelor of Computer Science (Bioinformatic)",
    sesi: "2017/2018",
    semester: 1,
    tahun: 1,
    teras: 32,
    elektif: 8,
    jumlah: 40,
  },
  {
    name: "Bachelor of Computer Science (Computer Network and Security)",
    sesi: "2017/2018",
    semester: 1,
    tahun: 1,
    teras: 32,
    elektif: 1,
    jumlah: 43,
  },
  {
    name: "Bachelor of Computer Science (Data Engineering)",
    sesi: "2017/2018",
    semester: 1,
    tahun: 1,
    teras: 34,
    elektif: 7,
    jumlah: 31,
  },
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

    <!-- Card List -->
    <div class="flex flex-col gap-4 px-4 py-2">
      <div
        v-for="(item, index) in curricula"
        :key="index"
        class="bg-blue-100 rounded-xl shadow p-4 relative"
      >
        <!-- Top right icon button -->
        <button
          class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
          title="Maklumat Jadual"
        >
          <!-- Document Icon SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2"/>
            <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <!-- Curriculum Info -->
        <div class="font-semibold text-lg mt-2 mb-1">{{ item.name }}</div>
        <div class="mb-1 text-base">
          <span class="font-light">Maklumat Mula Kemasukan:</span>
        </div>
        <div class="flex flex-row flex-wrap items-center gap-x-6 text-gray-700 text-sm mb-1">
          <div>Sesi: {{ item.sesi }}</div>
          <div>Semester: {{ item.semester }}</div>
          <div>Tahun: {{ item.tahun }}</div>
        </div>
        <!-- You can add teras/elektif/jumlah below if you want -->
        <!--
        <div class="flex flex-row gap-x-6 text-gray-600 text-xs mt-1">
          <div>Teras: {{ item.teras }}</div>
          <div>Elektif: {{ item.elektif }}</div>
          <div>Jumlah: {{ item.jumlah }}</div>
        </div>
        -->
      </div>
    </div>

    <!-- Pagination -->
    <div class="text-lg flex justify-center py-4 items-center gap-2">
      <span>&lt;&lt;</span>
      <span class="underline font-bold">1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>&gt;&gt;</span>
    </div>

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
