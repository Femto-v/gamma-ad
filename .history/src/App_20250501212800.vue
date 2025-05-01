<script setup>
import { createMemoryHistory, createRouter } from "vue-router";
import { ref, computed } from "vue";

import Login from "./views/Login.vue";
import Home from "./views/Home.vue";
</script>

<template>
    <component :is="currentView" />
</template>

<style scoped></style>
