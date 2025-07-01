<template>
    <div
        class="bg-white/90 border-2 m-4 border-blue-200 rounded-3xl shadow-xl px-7 py-6 flex flex-col gap-2 relative group hover:scale-105 hover:shadow-2xl transition cursor-pointer overflow-hidden"
        @click="onShowDetail"
    >
        <!-- Top emoji border -->
        <div
            class="absolute -top-5 left-0 w-full flex justify-between pointer-events-none"
        >
            <span class="text-2xl">📚</span>
            <span class="text-2xl">🌟</span>
            <span class="text-2xl">🎓</span>
            <span class="text-2xl">✨</span>
        </div>

        <!-- Modal Button -->
        <button
            class="absolute top-3 right-3 rounded-full bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 p-2 z-10 shadow-md transition"
            title="Maklumat Subjek"
            @click.stop="onShowDetail"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-6 h-6 text-blue-600"
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

        <!-- Main curriculum info -->
        <div
            class="text-xl font-bold text-blue-900 mt-4 mb-1 flex items-center gap-2"
        >
            {{ curriculum.name }}
            <span class="ml-1 text-lg">📒</span>
        </div>
        <div class="mb-1 text-base flex items-center gap-2">
            <span class="font-light text-gray-500">Admission Start:</span>
            <span class="text-yellow-500 text-xl">🛎️</span>
        </div>
        <div
            class="flex flex-row flex-wrap gap-3 text-gray-700 text-[15px] mb-2"
        >
            <span
                class="rounded-full bg-blue-50 px-3 py-1 border border-blue-200 flex items-center gap-1"
                >📅 <b>{{ curriculum.sesi }}</b></span
            >
            <span
                class="rounded-full bg-pink-50 px-3 py-1 border border-pink-200 flex items-center gap-1"
                >🏷️ Sem: <b>{{ curriculum.semester }}</b></span
            >
            <span
                class="rounded-full bg-amber-50 px-3 py-1 border border-yellow-200 flex items-center gap-1"
                >📆 Year: <b>{{ curriculum.tahun }}</b></span
            >
        </div>
        <div class="flex flex-row gap-4 mt-1 mb-2 text-[15px] font-semibold">
            <span
                class="rounded-xl border-2 border-blue-300 px-3 py-1 flex items-center gap-1 bg-blue-100"
            >
                🎯 Teras:
                <span class="font-bold text-blue-900">{{ terasCount }}</span>
            </span>
            <span
                class="rounded-xl border-2 border-pink-300 px-3 py-1 flex items-center gap-1 bg-pink-100"
            >
                🧩 Elective:
                <span class="font-bold text-pink-900">{{ electiveCount }}</span>
            </span>
            <span
                class="rounded-xl border-2 border-amber-300 px-3 py-1 flex items-center gap-1 bg-amber-100"
            >
                🧮 Total:
                <span class="font-bold text-amber-900">{{ totalCount }}</span>
            </span>
        </div>
        <!-- Bottom emoji border -->
        <div
            class="absolute -bottom-4 left-0 w-full flex justify-evenly pointer-events-none"
        >
            <span class="text-2xl">🌈</span>
            <span class="text-2xl">🦄</span>
            <span class="text-2xl">📖</span>
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
