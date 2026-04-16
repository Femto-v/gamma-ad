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
    <div class="bg-white border-b border-gray-100 px-5 pt-5 pb-5 text-center">
        <div class="flex items-center justify-center mb-3">
            <div class="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
                <img
                    src="/UTM-LOGO.png"
                    class="w-7 h-7 object-contain"
                    alt="UTM"
                />
            </div>
        </div>
        <h2 class="text-[22px] font-bold text-gray-900 tracking-tight leading-tight mb-1">
            {{ titleBanner }}
        </h2>
        <div class="flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-[13px] font-medium text-gray-500">{{ userInfo }}</span>
        </div>
    </div>
</template>
