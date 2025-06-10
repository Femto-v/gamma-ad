<template>
    <div class="bg-blue-100 rounded-xl shadow p-4 relative">
        <!-- Modal Button -->
        <button
            class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
            title="Maklumat Subjek"
            @click="onShowDetail"
        >
            <!-- Document Icon SVG -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <rect
                    x="6"
                    y="3"
                    width="12"
                    height="18"
                    rx="2"
                    stroke-width="2"
                />
                <path
                    d="M9 7h6M9 11h6M9 15h3"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>
        <div class="font-semibold text-lg mt-2 mb-1">{{ curriculum.name }}</div>
        <div class="mb-1 text-base">
            <span class="font-light">Admission Start Information:</span>
        </div>
        <div
            class="flex flex-row flex-wrap items-center gap-x-6 text-gray-700 text-sm mb-1"
        >
            <div>Session: {{ curriculum.sesi }}</div>
            <div>Semester: {{ curriculum.semester }}</div>
            <div>Year: {{ curriculum.tahun }}</div>
        </div>
        <div class="flex flex-row gap-x-6 text-gray-600 text-xs mt-1">
            <div>
                Teras: <b>{{ terasCount }}</b>
            </div>
            <div>
                Elektif: <b>{{ electiveCount }}</b>
            </div>
            <div>
                Total: <b>{{ totalCount }}</b>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    curriculum: Object,
    terasCount: Number,
    electiveCount: Number,
    totalCount: Number,
});
const emit = defineEmits(["show-detail"]);
function onShowDetail() {
    emit("show-detail", props.curriculum);
}
</script>
