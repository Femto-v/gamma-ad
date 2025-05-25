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

// Dummy lecturer data
const lecturers = ref([
  {
    name: "AB. RAZAK BIN CHE HUSSIN",
    subjectCount: 0,
    sectionCount: 0,
    studentCount: 0,
  },
  {
    name: "ADILA FIRDAUS BINTI ARBAIN",
    subjectCount: 4,
    sectionCount: 3,
    studentCount: 0,
  },
  {
    name: "AIDA BT. ALI",
    subjectCount: 3,
    sectionCount: 4,
    studentCount: 0,
  },
  {
    name: "AHMAD FARIZ BIN ALI",
    subjectCount: 3,
    sectionCount: 5,
    studentCount: 0,
  },
  // ... add more as needed
]);
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <!-- Main Content -->
    <main>
      <!-- Banner -->
      <div
        class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
        style="background-image: url('/backdropMain.jpg')"
      >
        <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
        <h2 class="text-2xl font-bold drop-shadow-md">Pensyarah</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
      </div>

      <!-- Lecturer Table -->
      <div class="overflow-x-auto p-4">
        <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
          <thead class="bg-[#b8d4ea]">
            <tr>
              <th class="border border-black px-2 py-1">Bil</th>
              <th class="border border-black px-2 py-1">Nama</th>
              <th class="border border-black px-2 py-1">Bil. Subjek</th>
              <th class="border border-black px-2 py-1">Bil. Seksyen</th>
              <th class="border border-black px-2 py-1">Bil. Pelajar</th>
              <th class="border border-black px-2 py-1">Subjek & Seksyen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lecturer, index) in lecturers" :key="index">
              <td class="border border-black px-2 py-1">{{ index + 1 }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.name }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.subjectCount }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.sectionCount }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.studentCount }}</td>
              <td class="border border-black px-2 py-1">
                <button class="mr-2 text-blue-600 hover:text-blue-900">📄</button>
              </td>
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
