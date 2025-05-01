<script setup>
import { createMemoryHistory, createRouter } from "vue-router";
import { ref, computed } from "vue";

import Login from "./views/Login.vue";
import Home from "./views/Home.vue";

const routes = [
    { path: "/", name: "Home", component: Home },
    { path: "/login", name: "Login", component: Login },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
</script>

<template>
    <component :is="currentView" />
</template>

<style scoped></style>
