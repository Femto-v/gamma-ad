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
        class="bg-cover bg-center h-60 text-black bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex flex-col justify-center items-center mx-3 mb-3 rounded-xl"
    >
        <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
        <h2 class="text-2xl font-bold drop-shadow-md">{{ titleBanner }}</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
    </div>
</template>
