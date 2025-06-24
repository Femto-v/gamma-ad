<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import SessionService from "@/api/SessionService";
const sidebarOpen = ref(false);
const analysisOpen = ref(false);
import AppIcon from "./AppIcon.vue";
const error = ref(null); //Buat error
const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
});

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
    SessionService.clearSession();
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
        :class="[
            'fixed top-0 left-0 z-20 w-full p-3flex justify-between items-center shadow transition-colors duration-300',
            isScrolled
                ? 'bg-blue-200/90 backdrop-blur-md shadow-lg'
                : 'bg-transparent',
        ]"
    >
        <button
            @click="toggleSidebar"
            class="text-2xl rounded-lg p-1 focus:outline-none hover:bg-blue-100 transition flex items-center gap-1"
            aria-label="Menu"
        >
            <span>☰</span>
        </button>
        <h1
            class="text-lg sm:text-xl font-black flex items-center gap-2 text-blue-900 drop-shadow"
        >
            <AppIcon name="timetable" class="w-7 h-7 text-blue-600 mr-1" />
            FC Timetable
            <span class="text-xl animate-pulse ml-1">📅</span>
        </h1>
        <div class="w-7"></div>
    </header>
    <!-- sidebar -->
    <div
        :class="[
            'fixed top-0 left-0 h-full w-72 max-w-[96vw] bg-white/80 shadow-2xl ring-1 ring-blue-100 backdrop-blur-xl transform transition-transform z-50',
            { '-translate-x-full': !sidebarOpen },
        ]"
    >
        <div
            class="p-4 border-b border-blue-200 bg-gradient-to-br from-blue-200/70 via-white/80 to-blue-100 flex justify-between items-center rounded-t-3xl"
        >
            <h2
                class="text-xl font-black tracking-tight text-blue-800 flex items-center gap-2"
            >
                <span>📋</span> Menu
            </h2>
            <button
                @click="toggleSidebar"
                class="text-2xl font-bold rounded-full px-2 hover:bg-blue-200 transition"
                aria-label="Close Menu"
            >
                &times;
            </button>
        </div>
        <nav class="flex flex-col p-3 text-base font-semibold gap-1">
            <a
                href="#"
                @click.prevent="loadMain"
                class="flex items-center gap-3 py-2 px-3 my-1 rounded-xl text-blue-900 hover:bg-blue-100 transition-all duration-200 text-[1.07rem] tracking-wide cursor-pointer leading-tight"
            >
                <span class="text-[1.25em]">🏠</span> Home
            </a>
            <a href="#" @click.prevent="loadTimetable" class="sidebar-link"
                ><span>📅</span> Timetable</a
            >
            <a href="#" @click.prevent="loadRuang" class="sidebar-link"
                ><span>🏛️</span> Venue</a
            >
            <a href="#" @click.prevent="loadSubjek" class="sidebar-link"
                ><span>📚</span> Subject</a
            >
            <a href="#" @click.prevent="loadPensyarah" class="sidebar-link"
                ><span>🧑‍🏫</span> Lecturer</a
            >
            <a href="#" @click.prevent="loadPelajar" class="sidebar-link"
                ><span>👩‍🎓</span> Student</a
            >
            <a href="#" @click.prevent="loadKurikulum" class="sidebar-link"
                ><span>🗂️</span> Curriculum</a
            >
            <a href="#" @click="logout" class="sidebar-link"
                ><span>🚪</span> Logout</a
            >
        </nav>
    </div>

    <!-- error message -->
    <div class="mt-20 sm:mt-24 px-2">
        <div
            v-if="error"
            class="bg-red-100 text-red-700 p-2 my-2 rounded text-sm shadow"
        >
            {{ error }}
        </div>
        <slot />
    </div>
</template>

<style scoped>
.sidebar-link span {
    font-size: 1.25em;
}
@media (max-width: 640px) {
    .sidebar-link {
        font-size: 1rem;
        padding-left: 0.7rem;
        padding-right: 0.7rem;
    }
}
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}
.animate-pulse {
    animation: pulse 2s infinite;
}
</style>
