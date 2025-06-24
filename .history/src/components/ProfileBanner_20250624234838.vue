<script setup>
//__IMPORT
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

//__DATA
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const properties = defineProps({
    titleBanner: {
        type: String,
        default: "Welcome",
    },
});
</script>

<template>
    <div class="relative">
        <!-- Glowing gradient circle for background wow effect -->
        <div
            class="absolute inset-0 flex justify-center items-center pointer-events-none select-none -z-10"
        >
            <div
                class="w-[320px] h-[170px] bg-gradient-to-br from-blue-200 via-pink-200 to-yellow-100 rounded-full blur-2xl opacity-50 animate-pulse"
            ></div>
        </div>
        <div
            class="relative bg-white/70 border-2 border-blue-100 shadow-xl rounded-3xl mx-auto w-full max-w-xl px-6 py-7 flex flex-col items-center mt-6 mb-2 backdrop-blur-lg"
        >
            <img
                src="/UTM-LOGO.png"
                class="w-16 mb-2 drop-shadow-lg rounded-full border-4 border-white"
                alt="UTM Logo"
            />
            <div class="flex items-center gap-3 mb-1">
                <span class="text-3xl animate-bounce">🎓</span>
                <h2
                    class="text-3xl sm:text-4xl font-extrabold text-blue-900 drop-shadow tracking-tight"
                >
                    {{ titleBanner }}
                </h2>
                <span class="text-3xl animate-bounce">🌟</span>
            </div>
            <p class="text-blue-700 font-semibold drop-shadow-sm text-lg">
                {{ userInfo }}
            </p>
        </div>
    </div>
</template>

<style scoped>
/* Subtle pulse on the gradient bg */
@keyframes pulse {
    0%,
    100% {
        opacity: 0.55;
    }
    50% {
        opacity: 0.75;
    }
}
.animate-pulse {
    animation: pulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
