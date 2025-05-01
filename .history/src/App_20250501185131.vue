<script setup>
import { ref, computed } from "vue";

import Login from "./router/Login.vue";
import Home from "./router/Home.vue";

const routes = {
    "/": Home,
    "/login": Login,
};

//router setting
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
