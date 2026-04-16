<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import SessionService from "@/api/SessionService";
import AppIcon from "./AppIcon.vue";

const sidebarOpen = ref(false);
const error = ref(null);
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

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
};

const navigate = (path) => {
    toggleSidebar();
    window.location.href = path;
};

const logout = () => {
    SessionService.clearSession();
    window.location.replace("/login");
};

const fetchWithErrorHandler = async (apiCall) => {
    try {
        error.value = null;
        const result = await apiCall();
        return result;
    } catch (err) {
        error.value = "Failed to Fetch Data: " + (err.message || err);
        console.error("[Fetch Error]", err);
        return null;
    }
};
</script>

<template>
    <!-- Header -->
    <header
        :class="[
            'fixed top-0 left-0 z-20 w-full px-4 h-14 flex justify-between items-center transition-all duration-200',
            isScrolled
                ? 'bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm'
                : 'bg-transparent',
        ]"
    >
        <button
            @click="toggleSidebar"
            class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors duration-150"
            aria-label="Open menu"
        >
            <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
        <h1 class="text-[15px] font-semibold text-gray-900 tracking-tight">
            FC Timetable
        </h1>
        <div class="w-9"></div>
    </header>

    <!-- Backdrop -->
    <Transition name="fade">
        <div
            v-if="sidebarOpen"
            class="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            @click="toggleSidebar"
        ></div>
    </Transition>

    <!-- Sidebar -->
    <div
        :class="[
            'fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
    >
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
            <span class="text-[15px] font-semibold text-gray-900">Menu</span>
            <button
                @click="toggleSidebar"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-150"
                aria-label="Close menu"
            >
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 overflow-y-auto py-3 px-3">
            <a href="#" @click.prevent="navigate('/main')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </span>
                <span>Home</span>
            </a>
            <a href="#" @click.prevent="navigate('/timetable')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </span>
                <span>Timetable</span>
            </a>
            <a href="#" @click.prevent="navigate('/ruang')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </span>
                <span>Venue</span>
            </a>
            <a href="#" @click.prevent="navigate('/subjek')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </span>
                <span>Subject</span>
            </a>
            <a href="#" @click.prevent="navigate('/pensyarah')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </span>
                <span>Lecturer</span>
            </a>
            <a href="#" @click.prevent="navigate('/pelajar')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                </span>
                <span>Student</span>
            </a>
            <a href="#" @click.prevent="navigate('/kurikulum')" class="nav-item">
                <span class="nav-icon-wrap">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </span>
                <span>Curriculum</span>
            </a>

            <!-- Divider -->
            <div class="my-3 h-px bg-gray-100 mx-1"></div>

            <a href="#" @click.prevent="logout" class="nav-item nav-item-danger">
                <span class="nav-icon-wrap nav-icon-wrap-danger">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </span>
                <span>Logout</span>
            </a>
        </nav>
    </div>

    <!-- Page Content Spacer -->
    <div class="pt-14">
        <div
            v-if="error"
            class="mx-4 mt-3 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100"
        >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
        </div>
        <slot />
    </div>
</template>

<style scoped>
.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    color: #1c1c1e;
    cursor: pointer;
    transition: background-color 0.12s ease;
    text-decoration: none;
    margin-bottom: 1px;
    -webkit-tap-highlight-color: transparent;
}
.nav-item:hover {
    background-color: #f2f2f7;
}
.nav-item:active {
    background-color: #e8e8ed;
}
.nav-item-danger {
    color: #d93025;
}
.nav-item-danger:hover {
    background-color: #fef2f2;
}
.nav-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: #f2f2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.nav-icon-wrap-danger {
    background-color: #fef2f2;
}
.nav-icon {
    width: 18px;
    height: 18px;
    color: #6e6e73;
}
.nav-item-danger .nav-icon {
    color: #d93025;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
