<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";

const sidebarOpen = ref(false);
const userInfo = ref("User Name - Matric No");

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
};

const loadMain = () => {
    toggleSidebar();
    window.location.href = "/main";
};

const loadTimetable = () => {
    toggleSidebar();
    window.location.href = "/timetable";
};

const loadRuang = () => {
    toggleSidebar();
    window.location.href = "/ruang";
};

const loadSubjek = () => {
    toggleSidebar();
    window.location.href = "/subjek";
};

const loadPensyarah = () => {
    toggleSidebar();
    window.location.href = "/pensyarah";
};

const loadPelajar = () => {
    toggleSidebar();
    window.location.href = "/pelajar";
};

const loadKurikulum = () => {
    toggleSidebar();
    window.location.href = "/kurikulum";
};

const logout = () => {
    localStorage.removeItem("web.fc.utm.my_usersession");
    window.location.replace("/login");
};

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
    <!-- Header -->
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
      <button @click="toggleSidebar" class="text-3xl">&#9776;</button>
      <h1 class="text-xl font-bold">Pensyarah</h1>
    </header>

    <!-- Sidebar -->
        <div
            :class="[
                'fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform z-50',
                { '-translate-x-full': !sidebarOpen },
            ]"
        >
            <div class="p-4 border-b flex justify-between items-center">
                <h2 class="text-sm font-semibold">&#x2190; Kembali</h2>
                <button @click="toggleSidebar" class="text-2xl">&times;</button>
            </div>
            <nav class="flex flex-col p-4 text-sm">
                <a
                    href="#"
                    @click.prevent="loadMain"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Home</a
                >
                <a
                    href="#"
                    @click.prevent="loadTimetable"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Jadual Waktu</a
                >
                <div class="group relative">
                    <button
                        class="py-2 text-left w-full text-gray-800 hover:bg-blue-100 rounded"
                    >
                        Analysis ▼
                    </button>
                </div>
                <a  
                    href="#" 
                    @click.prevent="loadRuang"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Ruang</a
                >
                <a  
                    href="#" 
                    @click.prevent="loadSubjek"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Subjek</a
                >
                <a 
                    href="#" 
                    @click.prevent="loadPensyarah"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Pensyarah</a
                >
                <a 
                    href="#" 
                    @click.prevent="loadPelajar"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Pelajar</a
                >
                <a 
                    href="#" 
                    @click.prevent="loadKurikulum"
                    class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Kurikulum</a
                >
                <a
                    href="#"
                    @click="logout"
                    class="py-2 text-red-600 hover:bg-red-100 rounded"
                    >Logout</a
                >
            </nav>
        </div>

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
                <button class="text-green-600 hover:text-green-900">✏️</button>
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
