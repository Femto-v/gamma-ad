<script setup>
console.log("Login Loaded . . . ");
import { ref } from "vue";
import AuthApi from "@/api/AuthApi";

const login = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);

// Instantiate the AuthApi class
const authApi = new AuthApi();

// HANDLE LOGIN
const handleLogin = async () => {
    try {
        isLoading.value = true;
        const data = await authApi.login(login.value, password.value);

        if (data?.[0]?.session_id) {
            alert("Login successful!");
            localStorage.setItem(
                "web.fc.utm.my_usersession",
                JSON.stringify(data[0])
            );
            sessionId.value = data[0].session_id;
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
    <div class="bg-pattern min-h-screen flex items-center justify-center px-4 animate-fadeIn">
        <!-- Background decorative elements -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-utm-red/5 to-utm-gold/10 rounded-full animate-float"></div>
            <div class="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-utm-gold/10 to-utm-red/5 rounded-full animate-float animation-delay-1s"></div>
            <div class="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-utm-red/5 to-utm-gold/5 rounded-full animate-float animation-delay-2s"></div>
        </div>

        <div class="w-full max-w-md glass-effect p-8 rounded-3xl shadow-2xl text-center animate-slideIn relative overflow-hidden">
            <!-- Decorative corner elements -->
            <div class="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-utm-red/10 to-transparent rounded-br-full"></div>
            <div class="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-utm-gold/20 to-transparent rounded-tl-full"></div>
            
            <!-- Logo Section -->
            <div class="logo-container mx-auto w-24 mb-4 animate-float">
                <div class="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <img
                        src="/UTM-LOGO-FULL.png"
                        alt="UTM Logo"
                        class="w-16 h-16 object-contain"
                    />
                </div>
            </div>

            <!-- System Title -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-utm-red mb-3">TTMS-FK</h2>
                <span class="inline-block bg-gradient-to-r from-utm-red to-utm-red/80 text-black px-6 py-2 rounded-full text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform duration-200">
                    Staff / Pelajar
                </span>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-5">
                <div class="text-left">
                    <label class="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                        Username
                    </label>
                    <div class="relative group">
                        <input
                            type="text"
                            v-model="login"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-utm-red input-glow transition-all duration-300 bg-white/80 backdrop-blur-sm group-focus-within:scale-105"
                            placeholder="Enter your username"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="text-left">
                    <label class="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                        Password
                    </label>
                    <div class="relative group">
                        <input
                            type="password"
                            v-model="password"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-utm-red input-glow transition-all duration-300 bg-white/80 backdrop-blur-sm group-focus-within:scale-105"
                            placeholder="Enter your password"
                        />
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full btn-gradient text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span v-if="!isLoading" class="flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                        Login
                    </span>
                    <span v-else class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    </span>
                </button>
            </form>

            <!-- Footer -->
            <div class="mt-6 text-xs text-gray-500">
                <p>Secure Login Portal</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg-pattern {
    background: 
        radial-gradient(circle at 20% 80%, rgba(115, 0, 0, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(224, 194, 139, 0.15) 0%, transparent 50%),
        linear-gradient(135deg, #9ed9e3 0%, #0d388f 100%);
}

.glass-effect {
    background: #E0FAFF;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.input-glow:focus {
    box-shadow: 0 0 0 3px rgba(115, 0, 0, 0.1), 0 0 20px rgba(115, 0, 0, 0.1);
}

.btn-gradient {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    transition: all 0.3s ease;
}

.btn-gradient:hover:not(:disabled) {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(30, 64, 175, 0.3);
}

.logo-container {
    position: relative;
}

.logo-container::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(45deg, rgba(115, 0, 0, 0.1), rgba(224, 194, 139, 0.2));
    border-radius: 50%;
    z-index: -1;
    animation: glow 3s ease-in-out infinite alternate;
}

/* Custom Tailwind Colors */
:root {
    --utm-red: #730000;
    --utm-gold: #e08b8b;
    --utm-light-gold: #f0e4c1;
}

.text-utm-red {
    color: var(--utm-red);
}

.text-utm-red\/80 {
    color: rgba(115, 0, 0, 0.8);
}

.bg-utm-red {
    background-color: var(--utm-red);
}

.border-utm-red {
    border-color: var(--utm-red);
}

.from-utm-red {
    --tw-gradient-from: var(--utm-red);
}

.to-utm-red {
    --tw-gradient-to: var(--utm-red);
}

.from-utm-red\/5 {
    --tw-gradient-from: rgba(115, 0, 0, 0.05);
}

.to-utm-gold\/10 {
    --tw-gradient-to: rgba(224, 194, 139, 0.1);
}

.from-utm-gold\/10 {
    --tw-gradient-from: rgba(224, 194, 139, 0.1);
}

.to-utm-red\/5 {
    --tw-gradient-to: rgba(115, 0, 0, 0.05);
}

.from-utm-gold\/20 {
    --tw-gradient-from: rgba(224, 194, 139, 0.2);
}

.to-utm-gold {
    --tw-gradient-to: var(--utm-gold);
}

.to-utm-red\/80 {
    --tw-gradient-to: rgba(115, 0, 0, 0.8);
}

/* Animations */
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

@keyframes glow {
    0% { box-shadow: 0 0 20px rgba(9, 163, 190, 0.3); }
    100% { box-shadow: 0 0 30px rgba(4, 3, 66, 0.6), 0 0 40px rgba(224, 194, 139, 0.3); }
}

@keyframes slideIn {
    0% { transform: translateY(50px); opacity: 0; }
    100% { transform: translateY(0px); opacity: 1; }
}

@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
}

.animate-slideIn {
    animation: slideIn 0.6s ease-out;
}

.animate-fadeIn {
    animation: fadeIn 0.8s ease-out;
}

.animation-delay-1s {
    animation-delay: 1s;
}

.animation-delay-2s {
    animation-delay: 2s;
}

.group-focus-within\:scale-105:focus-within {
    transform: scale(1.05);
}
</style>