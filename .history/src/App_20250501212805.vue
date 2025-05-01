<script setup>
import { createMemoryHistory, createRouter } from "vue-router";
import { ref, computed } from "vue";
</script>

<template>
    <component :is="currentView" />
</template>

<style scoped></style>
