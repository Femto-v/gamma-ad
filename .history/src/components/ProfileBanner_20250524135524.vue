<script setup>
//__IMPORT
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

//__DATA
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
    console.log("User Name: " + userName);
    console.log("User Matric: " + userMatric);
}
</script>

<template>
    <div
        class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
        style="background-image: url('/backdropMain.jpg')"
    >
        <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
        <h2 class="text-2xl font-bold drop-shadow-md">Welcome</h2>
        <p class="drop-shadow-md">{{ userInfo }}</p>
    </div>
</template>
