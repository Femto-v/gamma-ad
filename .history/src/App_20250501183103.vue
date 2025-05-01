<script setup>
import Login from "./components/Login.vue";

const routes = {
    "/": Home,
    "/login": Login,
};
</script>

<template>
    <Login />
</template>

<style scoped></style>
