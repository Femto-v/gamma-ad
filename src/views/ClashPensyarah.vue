<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

// Session-based user info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

// Dummy lecturer clash data
const lecturerClashes = ref([
  {
    name: "AHMAD FARIZ BIN ALI",
    sections: 5,
    conflicts: [
      "SECR1013-2:SCSR1013-1 (Wed 2pm-3pm)",
      "SECR1013-2:SCSR1013-3 (Mon 8am-9am)",
      "SECR1013-2:SCSR1013-2 (Mon 9am-10am)",
      "SCSR1033-4:SCSR1033-3 (Tue 12pm-1pm)",
      "SCSR1033-4:SCSR1033-3 (Wed 9am-10am)"
    ],
    suggestions: 0
  },
  {
    name: "CHAN WENG HOWE",
    sections: 4,
    conflicts: [
      "MCST1103-1:MCSD2123-1 (Mon 4pm-5pm)",
      "MCST1103-1:MCSD2123-1 (Mon 2pm-3pm)"
    ],
    suggestions: 0
  },
  {
    name: "FARKHANA BINTI MUCHTAR",
    sections: 3,
    conflicts: [
      "SECR2043-9:SECR2043-7 (Tue 8am-9am)",
      "SECR2043-9:SECR2043-8 (Thu 11am-12pm)",
      "SECR2043-9:SECR2043-8 (Thu 12pm-1pm)"
    ],
    suggestions: 7
  },
  {
    name: "ABDUL RASHEED KHAN BIN YUSOF KHAN",
    sections: 4,
    conflicts: [
      "MCSD1123-1:MCST1033-1 (Wed 10am-11am)",
      "MCSD1123-1:MCST1033-1 (Wed 12pm-1pm)"
    ],
    suggestions: 0
  },
  {
    name: "ABDUL RASHEED KHAN BIN YUSOF KHAN",
    sections: 3,
    conflicts: [
      "SCST1223-5:SCST1223-4 (Wed 11am-12pm)",
      "SCST1223-5:SCST1223-4 (Wed 12pm-1pm)"
    ],
    suggestions: 1
  }
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
        <h2 class="text-2xl font-bold drop-shadow-md">Clash Pensyarah</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
      </div>

      <!-- Clash Table -->
      <div class="overflow-x-auto px-4 py-4">
        <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
          <thead class="bg-[#b8d4ea]">
            <tr>
              <th class="border border-black px-2 py-1">Bil</th>
              <th class="border border-black px-2 py-1">Nama</th>
              <th class="border border-black px-2 py-1">Bil Seksyen</th>
              <th class="border border-black px-2 py-1">Pertindihan Jadual</th>
              <th class="border border-black px-2 py-1">Cadangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lecturer, index) in lecturerClashes" :key="index">
              <td class="border border-black px-2 py-1">{{ index + 1 }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.name }}</td>
              <td class="border border-black px-2 py-1">{{ lecturer.sections }}</td>
              <td class="border border-black px-2 py-1 text-left">
                <ul class="list-disc list-inside text-sm">
                  <li v-for="(clash, i) in lecturer.conflicts" :key="i">
                    {{ clash }}
                  </li>
                </ul>
              </td>
              <td class="border border-black px-2 py-1 font-semibold">
                {{ lecturer.suggestions }}
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
