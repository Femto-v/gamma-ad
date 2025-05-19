<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";

const sidebarOpen = ref(false);
const userInfo = ref("User Name - Matric No");

// Reactive values for session display
const sesi = ref("Sesi Tidak Diketahui");
const semester = ref("-");
const tarikhMula = ref("-");
const tarikhTamat = ref("-");

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
};

const loadTimetable = () => {
    toggleSidebar();
    window.location.href = "ttms-timetable.html";
};

const logout = () => {
    localStorage.removeItem("web.fc.utm.my_usersession");
    window.location.replace("/login");
};

onMounted(async () => {
    const data = await semesterApi.getCurrentSemesterInfo();

    // Optionally pick the latest (first) entry
    if (data && data.length > 0) {
        const latest = data[0];
        currentSession.value = latest.sesi;
        currentSemester.value = latest.semester;
        startDate.value = latest.tarikh_mula;
        endDate.value = latest.tarikh_tamat;
    }
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <!-- Header -->
        <header
            class="bg-blue-600 text-white p-4 flex justify-between items-center"
        >
            <button @click="toggleSidebar" class="text-3xl">&#9776;</button>
            <h1 class="text-xl font-bold">Dashboard</h1>
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
                <a href="#" class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Ruang</a
                >
                <a href="#" class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Subjek</a
                >
                <a href="#" class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Pensyarah</a
                >
                <a href="#" class="py-2 text-gray-800 hover:bg-blue-100 rounded"
                    >Pelajar</a
                >
                <a href="#" class="py-2 text-gray-800 hover:bg-blue-100 rounded"
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

        <!-- Main content -->
        <main>
            <div
                class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
                style="background-image: url('/backdropMain.jpg')"
            >
                <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
                <h2 class="text-2xl font-bold drop-shadow-md">Welcome</h2>
                <p class="drop-shadow-md">{{ userInfo }}</p>
            </div>

            <div class="p-4">
                <div class="bg-blue-100 rounded-xl shadow p-4">
                    <div class="grid grid-cols-2 text-sm">
                        <div class="font-bold">Sesi</div>
                        <div>{{ sesi }}</div>
                        <div class="font-bold">Semester</div>
                        <div>{{ semester }}</div>
                        <div class="font-bold">Tarikh Mula/Tamat</div>
                        <div>{{ tarikhMula }} / {{ tarikhTamat }}</div>
                    </div>
                </div>

                <p class="text-xs text-center mt-6">
                    Jika anda mempunyai sebarang komen atau pertanyaan mengenai
                    halaman web ini sila hubungi webmaster di
                    <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                        >ttms@fc.utm.my</a
                    ><br />
                    Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
                </p>
            </div>
        </main>
    </div>
</template>
