<script setup>
import { ref } from "vue";
const sidebarOpen = ref(false);
const analysisOpen = ref(false);
import AppIcon from "./AppIcon.vue";
const error = ref(null); //Buat error

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

//Analysis dropdown menu
const loadMasaruang = () => {
    toggleSidebar();
    window.location.href = "/masaruang";
};

const loadAnalysisSubjek = () => {
    toggleSidebar();
    window.location.href = "/analysissubjek";
};

const loadAnalysisPelajar = () => {
    toggleSidebar();
    window.location.href = "/analysispelajar";
};

const loadClashRuang = () => {
    toggleSidebar();
    window.location.href = "/clashruang";
};

const loadClashPensyarah = () => {
    toggleSidebar();
    window.location.href = "/clashpensyarah";
};

const loadClashPelajar = () => {
    toggleSidebar();
    window.location.href = "/clashpelajar";
};

//error try catch
const fetchWithErrorHandler = async (apiCall) => {
    try {
        error.value = null; // reset previous error
        const result = await apiCall();
        return result;
    } catch (err) {
        error.value = "Failed to Fetch Data: " + (err.message || err);
        console.error("[Fetch Error]", err);
        // You can also show toast here if you use a toast library
        return null;
    }
};
</script>

<template>
    <!-- header -->
    <header
        class="fixed top-0 left-0 z-2 w-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 text-black p-4 flex justify-between items-center"
    >
        <button @click="toggleSidebar" class="text-xl">&#9776;</button>
        <h1 class="text-xl font-bold">FC Timetable</h1>
        <!-- ada problem kalo make line header ini semua header bakal jadi tulisan header -->
    </header>
    <!-- sidebar -->
    <div
        :class="[
            'fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform z-50',
            { '-translate-x-full': !sidebarOpen },
        ]"
    >
        <div
            class="p-4 border-b-1 border-r-1 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 flex justify-between items-center"
        >
            <h2 class="text-xl font-bold">menu</h2>
            <button @click="toggleSidebar" class="text- xl">&times;</button>
        </div>
        <nav class="flex flex-col p-4 text-sm">
            <a
                href="#"
                @click.prevent="loadMain"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="home" class="w-5 h-5 text-blue-600" />
                <p>Home</p></a
            >
            <a
                href="#"
                @click.prevent="loadTimetable"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="timetable" class="w-5 h-5 text-blue-600" />
                <p>Timetable</p></a
            >
            <div class="relative">
                <button
                    @click="analysisOpen = !analysisOpen"
                    class="py-2 w-full text-left text-gray-800 hover:bg-blue-100 rounded flex justify-between items-center"
                >
                    <span
                        class="text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                        ><AppIcon
                            name="analysis"
                            class="w-5 h-5 text-blue-600"
                        />
                        <p>Analysis</p></span
                    >
                    <span v-if="!analysisOpen">▼</span>
                    <span v-else>▲</span>
                </button>
                <div
                    v-show="analysisOpen"
                    class="flex flex-col pl-4 mt-1 space-y-1 transition-all"
                >
                    <a
                        href="#"
                        @click.prevent="loadMasaruang"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Time & Venue</a
                    >
                    <a
                        href="#"
                        @click.prevent="loadAnalysisSubjek"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Subject</a
                    >
                    <a
                        href="#"
                        @click.prevent="loadAnalysisPelajar"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Student</a
                    >
                    <a
                        href="#"
                        @click.prevent="loadClashRuang"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Venue Clash</a
                    >
                    <a
                        href="#"
                        @click.prevent="loadClashPensyarah"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Lecture Clash</a
                    >
                    <a
                        href="#"
                        @click.prevent="loadClashPelajar"
                        class="text-gray-700 hover:bg-blue-50 rounded px-2 py-1"
                        >Student Clash</a
                    >
                </div>
            </div>

            <a
                href="#"
                @click.prevent="loadRuang"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="ruang" class="w-5 h-5 text-blue-600" />
                <p>Venue</p></a
            >
            <a
                href="#"
                @click.prevent="loadSubjek"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="subjek" class="w-5 h-5 text-blue-600" />
                <p>Subject</p></a
            >
            <a
                href="#"
                @click.prevent="loadPensyarah"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="lecturer" class="w-5 h-5 text-blue-600" />
                <p>Lecturer</p></a
            >
            <a
                href="#"
                @click.prevent="loadPelajar"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="student" class="w-5 h-5 text-blue-600" />
                <p>Student</p></a
            >
            <a
                href="#"
                @click.prevent="loadKurikulum"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="curriculum" class="w-5 h-5 text-blue-600" />
                <p>Curriculum</p></a
            >
            <a
                href="#"
                @click="logout"
                class="py-2 text-gray-800 hover:bg-blue-100 rounded flex gap-3 items-center"
                ><AppIcon name="logout" class="w-5 h-5 text-blue-600" />
                <p>Logout</p></a
            >
        </nav>
    </div>

    <!-- error message -->
    <div>
        <!-- Reusable Toggle button, layout, etc. -->

        <div
            v-if="error"
            class="bg-red-100 text-red-700 p-2 my-2 rounded text-sm"
        >
            {{ error }}
        </div>

        <!-- Use slot or default content here -->
        <slot />
    </div>
</template>
