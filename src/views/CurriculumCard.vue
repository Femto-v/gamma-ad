<template>
    <div
        class="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-5 flex flex-col gap-2 relative hover:shadow-md transition-shadow duration-200 cursor-pointer"
        @click="onShowDetail"
    >
        <!-- Info button -->
        <button
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200 flex items-center justify-center z-10 transition-colors duration-150"
            title="View subjects"
            @click.stop="onShowDetail"
        >
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        </button>

        <!-- Curriculum name -->
        <div class="text-[15px] font-bold text-gray-900 pr-10 leading-snug">
            {{ curriculum.name }}
        </div>

        <div class="text-[12px] text-gray-400 font-medium">Admission Start</div>

        <!-- Session / Semester / Year pills -->
        <div class="flex flex-row flex-wrap gap-2 text-[12px] mb-1">
            <span class="rounded-full bg-blue-50 px-2.5 py-1 border border-blue-100 text-blue-700 font-medium">
                {{ curriculum.sesi }}
            </span>
            <span class="rounded-full bg-gray-50 px-2.5 py-1 border border-gray-200 text-gray-600 font-medium">
                Sem {{ curriculum.semester }}
            </span>
            <span class="rounded-full bg-amber-50 px-2.5 py-1 border border-amber-100 text-amber-700 font-medium">
                Year {{ curriculum.tahun }}
            </span>
        </div>

        <!-- Stats row -->
        <div class="flex flex-row gap-2 mt-1 text-[12px] font-semibold">
            <span class="flex-1 rounded-xl border border-blue-100 px-2.5 py-1.5 flex items-center gap-1 bg-blue-50 text-blue-800">
                <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                Core: <span class="font-bold text-blue-900 ml-0.5">{{ terasCount }}</span>
            </span>
            <span class="flex-1 rounded-xl border border-pink-100 px-2.5 py-1.5 flex items-center gap-1 bg-pink-50 text-pink-800">
                Elective: <span class="font-bold text-pink-900 ml-0.5">{{ electiveCount }}</span>
            </span>
            <span class="flex-1 rounded-xl border border-amber-100 px-2.5 py-1.5 flex items-center gap-1 bg-amber-50 text-amber-800">
                Total: <span class="font-bold text-amber-900 ml-0.5">{{ totalCount }}</span>
            </span>
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
