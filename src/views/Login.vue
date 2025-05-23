<script setup>
console.log("Login Loaded . . . ");
import { ref } from "vue";
import AuthApi from "@/api/AuthApi";

const login = ref("A16CS4016");
const password = ref("201608M10112");
const sessionId = ref("");

// Instantiate the AuthApi class
const authApi = new AuthApi();

// HANDLE LOGIN
const handleLogin = async () => {
    try {
        const data = await authApi.login(login.value, password.value);

        if (data?.[0]?.session_id) {
            console.log("Login successful!");
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
    }
};
</script>

<template>
    <div
        class="bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] bg-repeat min-h-screen flex items-center justify-center px-4"
    >
        <div
            class="w-full max-w-xs bg-[#e0c28b] p-6 rounded-2xl shadow-lg text-center"
        >
            <img
                src="/UTM-LOGO-FULL.png"
                alt="UTM Logo"
                class="mx-auto w-20 mb-2"
            />
            <h1 class="text-3xl font-bold text-[#730000] tracking-wide mb-1">
                UTM
            </h1>
            <p class="text-[#730000] font-semibold text-sm -mt-2 mb-4">
                UNIVERSITI TEKNOLOGI MALAYSIA
            </p>

            <h2 class="text-xl font-bold text-[#730000] mb-2">TTMS-FK</h2>
            <button
                class="bg-[#730000] text-white px-4 py-1 rounded-full mb-4 shadow"
            >
                Staff/Pelajar
            </button>

            <div class="mb-3 text-left text-black">
                <label class="text-sm font-bold text-gray-700">Username</label>
                <input
                    type="text"
                    v-model="login"
                    class="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#730000]"
                />
            </div>

            <div class="mb-4 text-left text-black">
                <label class="text-sm font-bold text-gray-700">Password</label>
                <input
                    type="password"
                    v-model="password"
                    class="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#730000]"
                />
            </div>

            <button
                @click="handleLogin"
                class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded w-full"
            >
                Submit
            </button>
        </div>
    </div>
</template>
