<script setup>
import { createMemoryHistory, createRouter } from "vue-router";

import Login from "./router/Login.vue";
import Home from "./router/Home.vue";

const routes = [
    { path: "/", component: HomeView },
    { path: "/about", component: AboutView },
];
//router setting
const router = createRouter({
    history: createMemoryHistory(),
    routes,
});
</script>

<template>
    <component :is="currentView" />
</template>

<style scoped></style>
