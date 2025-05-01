<script setup>
import { createMemoryHistory, createRouter } from "vue-router";
import { ref, computed } from "vue";

import Login from "./views/Login.vue";
import Home from "./views/Home.vue";

const routes = {
    "/": Home,
    "/about": About,
};

const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
    currentPath.value = window.location.hash;
});

const currentView = computed(() => {
    return routes[currentPath.value.slice(1) || "/"] || NotFound;
});
</script>

<template>
    <component :is="currentView" />
</template>

<style scoped></style>
