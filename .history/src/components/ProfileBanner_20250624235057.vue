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
    <div
        class="bg-cover bg-center h-60 text-black flex flex-col justify-center items-center pt-18 bg-gradient-to-b from-transparent via-blue-200 to-blue-300"
    >
        <img
            src="/UTM-LOGO.png"
            class="w-16 mb-2 drop-shadow-xl rounded-full border-4 border-white"
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
        <div class="flex items-center gap-2 mt-1">
            <span class="text-lg text-blue-700">👤</span>
            <span class="font-bold text-blue-800 text-lg drop-shadow-sm">{{
                userInfo
            }}</span>
            <span
                class="font-mono text-xs bg-blue-100 rounded-full px-3 py-1 border border-blue-300 ml-2"
                v-if="userMatric && userName"
            >
                🆔 {{ userMatric }} &mdash; {{ userName }}
            </span>
        </div>
    </div>
</template>
