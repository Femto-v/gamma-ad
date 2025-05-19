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

// Static timetable data (example only)
const timetable = ref([
  {
    time: "07:00 AM – 07:50 AM",
    slots: ["", "", "", "", "", "", ""],
  },
  {
    time: "08:00 AM – 08:50 AM",
    slots: ["", "", "", "", "", "", ""],
  },
  {
    time: "09:00 AM – 09:50 AM",
    slots: ["", "SECI0131-1 [30] MPK9", "", "", "", "", ""],
  },
  {
    time: "10:00 AM – 10:50 AM",
    slots: ["", "", "SECJ3104-1 [25] MPK9", "", "", "", ""],
  },
  // ... Add all time slots here
]);

</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <!-- Header -->
    <header
        class="bg-blue-600 text-white p-4 flex justify-between items-center"
    >
      <button @click="toggleSidebar" class="text-3xl">&#9776;</button>
      <h1 class="text-xl font-bold">Jadual Waktu</h1>
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
        <div 
            class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
            style="background-image: url('/backdropMain.jpg')"
        >
            <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
            <h2 class="text-2xl font-bold drop-shadow-md">Jadual Waktu</h2>
            <p class="drop-shadow-md">{{ userInfo }}</p>
        </div>

    <!-- Timetable Table -->
    <div class="overflow-x-auto p-4">
      <table class="w-full border border-black text-sm text-center bg-[#d0e7f7]">
        <thead class="bg-[#b8d4ea]">
          <tr>
            <th class="border border-black px-2 py-1">Masa</th>
            <th class="border border-black px-2 py-1">Waktu</th>
            <th class="border border-black px-2 py-1">Ahad</th>
            <th class="border border-black px-2 py-1">Isnin</th>
            <th class="border border-black px-2 py-1">Selasa</th>
            <th class="border border-black px-2 py-1">Rabu</th>
            <th class="border border-black px-2 py-1">Khamis</th>
            <th class="border border-black px-2 py-1">Jumaat</th>
            <th class="border border-black px-2 py-1">Sabtu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in timetable" :key="index">
            <td class="border border-black px-1 py-1">{{ index + 1 }}</td>
            <td class="border border-black px-1 py-1">{{ row.time }}</td>
            <td v-for="(slot, idx) in row.slots" :key="idx" class="border border-black px-1 py-1">
              <div v-if="slot !== ''" class="text-white font-bold p-1 rounded"
                   :class="[
                     slot.includes('SECJ3104') ? 'bg-cyan-500' :
                     slot.includes('SECI0131') ? 'bg-pink-400' :
                     slot.includes('SECJ3443') ? 'bg-red-600' :
                     slot.includes('SECJ3623') ? 'bg-green-500' :
                     slot.includes('SECJ3563') ? 'bg-yellow-300' :
                     slot.includes('ULRS3032') ? 'bg-orange-400' :
                     'bg-gray-300'
                   ]">
                {{ slot }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </main>

    <!-- Footer -->
    <p class="text-xs text-center mt-6 px-4">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
