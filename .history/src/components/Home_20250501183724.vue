<template>
    <div>THIS IS HOME</div>
</template>

<script setup>
console.log("home page loaded . . . ");

const currentPath = ref(window.location.hash);

window.addEventListener("hashchange", () => {
    currentPath.value = window.location.hash;
});

const currentView = computed(() => {
    return routes[currentPath.value.slice(1) || "/"] || NotFound;
});
</script>

<style scoped></style>
