<script setup>
import { ref } from "vue";
const sidebarOpen = ref(false);
//button function
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
</script>



<template>
    <!-- header -->
    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
        <button @click="toggleSidebar" class="text-3xl">&#9776;</button>
        <h1 class="text-xl font-bold">Jadual Waktu</h1>
    </header> 
    <!-- sidebar -->
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
</template>