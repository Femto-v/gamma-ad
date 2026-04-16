<script setup>
import { ref } from "vue";
import AuthApi from "@/api/AuthApi";
import PelajarApi from "@/api/PelajarApi.js";
import SessionService from "@/api/SessionService";

const login = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);

const authApi = new AuthApi();
const PREFETCH_SESI = "2024/2025";
const PREFETCH_SEMESTER = 2;

const mapStudent = (item) => ({
    name: item.nama,
    year: item.tahun_kursus,
    course: item.kod_kursus,
    faculty: item.kod_fakulti,
    subjectCount: item.bil_subjek,
    no_matrik: item.no_matrik,
    no_kp: item.no_kp,
});

const prefetchStudents = async (sessionId) => {
    try {
        const api = new PelajarApi(sessionId);
        const students = await api.getPelajar(
            PREFETCH_SESI,
            PREFETCH_SEMESTER,
            20,
            0
        );
        if (Array.isArray(students) && students.length) {
            SessionService.savePrefetchedStudents(
                students.map(mapStudent)
            );
        }
    } catch (err) {
        console.error("Student prefetch failed:", err);
    }
};

const setCookie = (name, value, hours) => {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
};

const handleLogin = async () => {
    try {
        isLoading.value = true;
        const data = await authApi.login(login.value, password.value);

        if (data?.[0]?.session_id) {
            const sessionObj = data[0];
            alert("Login successful!");
            // Store in both localStorage and cookie for compatibility
            localStorage.setItem(
                "web.fc.utm.my_usersession",
                JSON.stringify(sessionObj)
            );
            SessionService.saveSession(sessionObj);
            SessionService.clearPrefetchedStudents();
            prefetchStudents(sessionObj.session_id);
            setCookie("session_id", sessionObj.session_id, 1); // 1 hour expiry
            window.location.replace("/main");
        } else {
            alert("Invalid login response!");
            console.log("Response:", data);
        }
    } catch (error) {
        alert("Invalid credentials or failed to fetch!");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-[#f2f2f7] flex items-center justify-center px-4">
        <div class="w-full max-w-sm">

            <!-- Logo + Title -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-white shadow-md border border-gray-100 mb-4">
                    <img
                        src="/UTM-LOGO-FULL.png"
                        alt="UTM"
                        class="w-14 h-14 object-contain"
                    />
                </div>
                <h1 class="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">TTMS-FK</h1>
                <p class="text-[14px] text-gray-500 mt-1">Faculty of Computing Timetable System</p>
            </div>

            <!-- Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-6">
                    <!-- Role pill -->
                    <div class="flex justify-center mb-6">
                        <span class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full tracking-wide uppercase">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Staff &amp; Student Portal
                        </span>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-4">
                        <!-- Username -->
                        <div>
                            <label class="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                Username
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    v-model="login"
                                    class="w-full pl-10 pr-4 py-2.5 text-[15px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-150 placeholder:text-gray-400"
                                    placeholder="Enter your username"
                                    autocomplete="username"
                                />
                            </div>
                        </div>

                        <!-- Password -->
                        <div>
                            <label class="block text-[13px] font-semibold text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    v-model="password"
                                    class="w-full pl-10 pr-4 py-2.5 text-[15px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-150 placeholder:text-gray-400"
                                    placeholder="Enter your password"
                                    autocomplete="current-password"
                                />
                            </div>
                        </div>

                        <!-- Submit -->
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="w-full mt-2 py-3 px-4 bg-[#0a3270] hover:bg-[#0d3d87] active:bg-[#08265a] text-white text-[15px] font-semibold rounded-xl shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg
                                v-if="isLoading"
                                class="animate-spin w-4 h-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <svg
                                v-else
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            {{ isLoading ? 'Signing in...' : 'Sign In' }}
                        </button>
                    </form>
                </div>

                <!-- Footer stripe -->
                <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p class="text-[11px] text-gray-400">Secure Login &mdash; UTM Faculty of Computing</p>
                </div>
            </div>

        </div>
    </div>
</template>
