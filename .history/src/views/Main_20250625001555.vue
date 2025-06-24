<template>
    <div
        class="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 min-h-screen"
    >
        <Toggle />
        <ProfileBanner />

        <main class="flex-1 flex flex-col items-center p-2 pt-5">
            <!-- Floating Profile Avatar Card -->
            <div class="relative w-full max-w-xs flex justify-center mb-5">
                <div
                    class="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-16 bg-gradient-to-br from-blue-200 via-white to-pink-100 blur-lg rounded-full opacity-70 pointer-events-none"
                ></div>
                <div
                    class="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-blue-100 relative z-10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-20 w-20 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <circle cx="12" cy="8" r="4" stroke-width="2" />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 20c0-4 4-7 8-7s8 3 8 7"
                        />
                    </svg>
                    <span
                        class="absolute -bottom-2 right-0 text-2xl animate-bounce"
                        >🎉</span
                    >
                </div>
            </div>

            <!-- 2 Badge Info Cards Side-by-Side -->
            <div class="flex flex-row gap-3 mb-4 w-full max-w-xs">
                <!-- Credit Info -->
                <div
                    class="flex-1 glass-card flex flex-col items-center justify-center p-3 rounded-xl border-2 border-blue-200 shadow-lg"
                >
                    <div
                        class="flex items-center gap-1 text-xl font-bold text-blue-800"
                    >
                        <span class="text-2xl">💠</span>
                        {{ creditInfo }}
                    </div>
                    <div
                        class="text-xs text-blue-600 mt-1 tracking-wide font-medium"
                    >
                        Credit Counted
                    </div>
                </div>
                <!-- Year/Course Info -->
                <div
                    class="flex-1 glass-card flex flex-col items-center justify-center p-3 rounded-xl border-2 border-pink-200 shadow-lg"
                >
                    <div
                        class="flex items-center gap-1 text-xl font-bold text-pink-700"
                    >
                        <span class="text-2xl">🎓</span>
                        {{ yearCourse }}
                    </div>
                    <div
                        class="text-xs text-pink-600 mt-1 tracking-wide font-medium"
                    >
                        Year / Course
                    </div>
                </div>
            </div>

            <!-- Session, Semester, Date: Large Info Cards -->
            <div class="w-full max-w-xs flex flex-col gap-3">
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >📆 Session</span
                    >
                    <span
                        class="text-blue-900 font-bold text-lg tracking-wide"
                        >{{ currentSession }}</span
                    >
                </div>
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >🎯 Semester</span
                    >
                    <span
                        class="text-blue-900 font-bold text-lg tracking-wide"
                        >{{ currentSemester }}</span
                    >
                </div>
                <div
                    class="glass-card bg-blue-100/70 rounded-2xl border-2 border-blue-200 shadow flex justify-between items-center px-5 py-3"
                >
                    <span
                        class="font-semibold flex items-center gap-2 text-blue-700"
                        >📅 Date</span
                    >
                    <span
                        class="text-blue-800 font-semibold text-sm text-right leading-tight"
                        >{{ startDate }}<br class="block sm:hidden" />/
                        {{ endDate }}</span
                    >
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>

<style scoped>
.glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
}
</style>
