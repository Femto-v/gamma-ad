<script setup>
import { ref } from "vue";
import KurikulumApi from "@/api/KurikulumApi.js";

const props = defineProps({
    show: Boolean,
    subjects: Array,
    curriculumName: String,
});
const emit = defineEmits(["close"]);
const electiveDetail = ref(null);
const loadingElective = ref(false);

function close() {
    electiveDetail.value = null;
    emit("close");
}
async function showElective(id_kurikulum_subjek) {
    loadingElective.value = true;
    electiveDetail.value = null;
    try {
        const api = new KurikulumApi();
        electiveDetail.value = await api.getElectiveDetails(
            id_kurikulum_subjek
        );
    } catch (e) {
        electiveDetail.value = { "s.nama_subjek": "Gagal memuat detail." };
    } finally {
        loadingElective.value = false;
    }
}
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/70 via-white/80 to-pink-100/60 backdrop-blur-sm"
    >
        <div
            class="bg-white/95 rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[92vh] relative flex flex-col border-2 border-blue-100"
            @click.stop
        >
            <!-- Close button -->
            <button
                @click="close"
                class="absolute top-3 right-4 text-2xl bg-blue-100 rounded-full px-2 py-1 hover:bg-pink-200 z-10 font-bold shadow transition"
                title="Tutup"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 class="font-bold text-xl text-gray-900 mb-3 pr-10 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Subjects &mdash; {{ curriculumName }}
            </h3>

            <!-- Timeline/List Style -->
            <div
                class="overflow-y-auto flex-1 space-y-4 pr-2"
                style="max-height: 60vh"
            >
                <div
                    v-for="subject in subjects"
                    :key="subject.id_kurikulum_subjek"
                    class="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl border-2 border-blue-100 shadow-sm bg-gradient-to-r from-blue-50 via-white to-pink-50 p-4 relative"
                >
                    <div class="flex flex-row items-center gap-2 mb-2 sm:mb-0">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <span class="font-mono text-blue-800 font-bold text-sm">{{ subject.kod_subjek }}</span>
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900 text-[14px]">{{ subject.nama_subjek }}</div>
                        <div class="flex flex-wrap gap-2 mt-1">
                            <span class="inline-block bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                                {{ subject.kredit }} Credit
                            </span>
                            <span class="inline-block bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                Year {{ subject.tahun_ambil }}
                            </span>
                            <span class="inline-block bg-pink-50 border border-pink-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-pink-800">
                                Sem {{ subject.semester_ambil }}
                            </span>
                            <span class="inline-block bg-green-50 border border-green-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-green-800">
                                <span v-if="subject.mod_elektif">Elective</span>
                                <span v-else>Core</span>
                            </span>
                            <button v-if="subject.mod_elektif" class="text-blue-600 underline font-semibold hover:text-blue-800 text-[11px] ml-1 transition-colors"
                                @click="showElective(subject.id_kurikulum_subjek)">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-if="electiveDetail"
                class="border-t-2 border-blue-100 pt-3 text-base text-gray-700 mt-2 bg-blue-50/50 rounded-2xl px-4"
            >
                <div
                    class="mb-1 font-semibold text-blue-900 flex items-center gap-1"
                >
                    Elective Detail:
                </div>
                <div>
                    <b>Subject Code:</b> {{ electiveDetail["se.kod_subjek"] }}
                </div>
                <div>
                    <b>Subject Name:</b> {{ electiveDetail["s.nama_subjek"] }}
                </div>
                <div><b>Credit:</b> {{ electiveDetail["s.kredit"] }}</div>
            </div>
            <div v-if="loadingElective" class="text-xs text-blue-400 mt-2">
                Loading detail elective...
            </div>
        </div>
    </div>
</template>
