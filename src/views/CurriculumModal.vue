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
                ✕
            </button>
            <h3
                class="font-extrabold text-2xl text-blue-900 mb-3 pr-10 flex items-center gap-2"
            >
                <span>📖</span> Subjects — {{ curriculumName }}
            </h3>
            <div class="w-full flex justify-center gap-2 mb-3">
                <span class="text-lg">🔸</span>
                <span class="text-lg">✨</span>
                <span class="text-lg">🔸</span>
            </div>

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
                        <span class="text-2xl">📘</span>
                        <span class="font-mono text-blue-800 font-bold">{{
                            subject.kod_subjek
                        }}</span>
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold text-blue-900 text-lg">
                            {{ subject.nama_subjek }}
                        </div>
                        <div class="flex flex-wrap gap-2 mt-1">
                            <span
                                class="inline-block bg-blue-100 border border-blue-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-blue-900"
                                >🎯 {{ subject.kredit }} Credit</span
                            >
                            <span
                                class="inline-block bg-yellow-100 border border-yellow-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-yellow-900"
                                >🗓️ Year: {{ subject.tahun_ambil }}</span
                            >
                            <span
                                class="inline-block bg-pink-100 border border-pink-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-pink-900"
                                >📅 Semester: {{ subject.semester_ambil }}</span
                            >
                            <span
                                class="inline-block bg-green-100 border border-green-300 rounded-lg px-2 py-0.5 text-xs font-semibold text-green-900"
                            >
                                <span v-if="subject.mod_elektif"
                                    >🌈 Elective</span
                                >
                                <span v-else>🎓 Teras</span>
                            </span>
                            <button
                                v-if="subject.mod_elektif"
                                class="text-blue-600 underline font-semibold hover:text-pink-500 text-xs ml-2"
                                @click="
                                    showElective(subject.id_kurikulum_subjek)
                                "
                            >
                                Detail 🌟
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
                    🌈 Detail Elective:
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
