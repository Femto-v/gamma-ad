<script setup>
import IconLibrary from "@/icons/IconLibrary.js";

const props = defineProps({
    name: String,
    class: {
        type: String,
        default: "",
    },
});

const iconSvg = IconLibrary[props.name] || "";
</script>

<template>
    <span v-if="iconSvg" v-html="iconSvg" :class="class" />
</template>
