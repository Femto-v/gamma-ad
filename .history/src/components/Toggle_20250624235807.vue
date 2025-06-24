<template>
    <!-- header -->
    <header
        :class="[
            'fixed top-0 left-0 z-20 w-full p-4 flex justify-between items-center shadow transition-colors duration-300',
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
            <a href="#" @click.prevent="loadMain" class="sidebar-link"
                ><span>🏠</span> Home</a
            >
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
.sidebar-link {
    @apply flex items-center gap-3 py-2 px-3 my-1 rounded-xl text-blue-900 hover:bg-blue-100 transition-all duration-200;
    font-size: 1.07rem;
    letter-spacing: 0.01em;
    cursor: pointer;
    line-height: 1.3;
}
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
