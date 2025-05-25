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

// Dummy dropdown filter options
const selectedKurikulum = ref("Semua");
const selectedSubject = ref("Semua");

// Dummy subject data
const subjects = ref([
  {
    code: "MAST2023",
    name: "Data Science Fundamentals",
    shortCode: "FSKSM",
    kredit: 3,
    bilSubjek: 2,
    drPensyarah: 2,
    bilPelajar: 60,
    subjekDanSubseksyen: "D",
  },
  {
    code: "MAST2024",
    name: "Big Data Analytics",
    shortCode: "FSKSM",
    kredit: 3,
    bilSubjek: 4,
    drPensyarah: 2,
    bilPelajar: 70,
    subjekDanSubseksyen: "D",
  },
  // ... more rows as needed
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
        <h2 class="text-2xl font-bold drop-shadow-md">Subjek</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
      </div>

      <!-- Filters -->
      <div class="p-4 flex flex-col sm:flex-row gap-4 justify-start items-center text-sm">
        <div>
          Kurikulum:
          <select v-model="selectedKurikulum" class="ml-1 px-2 py-1 border rounded">
            <option value="Semua">Semua</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          Kod/Nama Subjek:
          <select v-model="selectedSubject" class="ml-1 px-2 py-1 border rounded">
            <option value="Semua">Semua</option>
            <option value="MAST2023">MAST2023</option>
            <option value="MAST2024">MAST2024</option>
          </select>
        </div>
      </div>

      <!-- Subject Table -->
      <div class="overflow-x-auto px-4">
        <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
          <thead class="bg-[#b8d4ea]">
            <tr>
              <th class="border border-black px-2 py-1">Kod Subjek</th>
              <th class="border border-black px-2 py-1">Nama Subjek</th>
              <th class="border border-black px-2 py-1">Kod Fakulti</th>
              <th class="border border-black px-2 py-1">Kredit</th>
              <th class="border border-black px-2 py-1">Bil. Subjek</th>
              <th class="border border-black px-2 py-1">Dr. Pensyarah</th>
              <th class="border border-black px-2 py-1">Bil. Pelajar</th>
              <th class="border border-black px-2 py-1">Subjek & Subseksyen</th>
              <th class="border border-black px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(subject, index) in subjects" :key="index">
              <td class="border border-black px-2 py-1">{{ subject.code }}</td>
              <td class="border border-black px-2 py-1">{{ subject.name }}</td>
              <td class="border border-black px-2 py-1">{{ subject.shortCode }}</td>
              <td class="border border-black px-2 py-1">{{ subject.kredit }}</td>
              <td class="border border-black px-2 py-1">{{ subject.bilSubjek }}</td>
              <td class="border border-black px-2 py-1">{{ subject.drPensyarah }}</td>
              <td class="border border-black px-2 py-1">{{ subject.bilPelajar }}</td>
              <td class="border border-black px-2 py-1">{{ subject.subjekDanSubseksyen }}</td>
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
