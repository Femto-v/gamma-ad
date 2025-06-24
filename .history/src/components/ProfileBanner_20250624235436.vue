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
        class="bg-cover bg-center h-52 sm:h-60 text-black flex flex-col justify-center items-center pt-14 sm:pt-18 bg-gradient-to-b from-transparent via-blue-200 to-blue-300"
    >
        <img
            src="/UTM-LOGO.png"
            class="w-14 sm:w-16 mb-1 sm:mb-2 drop-shadow-xl rounded-full border-4 border-white"
            alt="UTM Logo"
        />
        <div
            class="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap justify-center w-full px-2"
        >
            <span class="text-2xl sm:text-3xl animate-bounce">🎓</span>
            <h2
                class="text-xl sm:text-3xl font-extrabold text-blue-900 drop-shadow tracking-tight text-center break-words"
            >
                {{ titleBanner }}
            </h2>
            <span class="text-2xl sm:text-3xl animate-bounce">🌟</span>
        </div>
        <div
            class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mt-1 w-full px-2"
        >
            <span
                class="flex items-center gap-1 text-base sm:text-lg text-blue-700"
            >
                👤
                <span
                    class="font-bold text-blue-800 truncate max-w-[180px] sm:max-w-xs"
                    >{{ userInfo }}</span
                >
            </span>
        </div>
    </div>
</template>
