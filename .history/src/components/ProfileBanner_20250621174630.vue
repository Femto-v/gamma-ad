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
        class="bg-cover bg-center h-60 text-black bg-gradient-to-b from-blue-500 via-blue-200 to-blue-300 flex flex-col justify-center items-center pt-18"
    >
        <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
        <h2 class="text-2xl font-bold drop-shadow-md">{{ titleBanner }}</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
    </div>
</template>
