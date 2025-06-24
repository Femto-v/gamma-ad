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
                class="font-extrabold text-2xl text-blue-900 mb-2 pr-10 flex items-center gap-2"
            >
                <span>📖</span> Subjects — {{ curriculumName }}
            </h3>
            <!-- Emoji separator -->
            <div class="w-full flex justify-center gap-2 mb-2">
                <span class="text-lg">🔸</span>
                <span class="text-lg">✨</span>
                <span class="text-lg">🔸</span>
            </div>
            <div
                class="overflow-x-auto overflow-y-auto flex-1"
                style="max-height: 60vh"
            >
                <table
                    class="w-full mb-4 rounded-2xl overflow-hidden border-2 border-blue-200 shadow"
                >
                    <thead>
                        <tr
                            class="bg-blue-50 text-blue-800 border-b sticky top-0 z-10 text-base"
                        >
                            <th class="p-3">🔖 Code</th>
                            <th class="p-3">📚 Name</th>
                            <th class="p-3">🎯 Credit</th>
                            <th class="p-3">🗓️ Year</th>
                            <th class="p-3">🧭 Semester</th>
                            <th class="p-3">🧩 Type</th>
                            <th class="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="subject in subjects"
                            :key="subject.id_kurikulum_subjek"
                            class="border-b border-blue-100 hover:bg-blue-50/50 transition"
                        >
                            <td class="p-3 font-mono text-blue-800">
                                {{ subject.kod_subjek }}
                            </td>
                            <td class="p-3">{{ subject.nama_subjek }}</td>
                            <td class="p-3 text-center">
                                {{ subject.kredit }}
                            </td>
                            <td class="p-3 text-center">
                                {{ subject.tahun_ambil }}
                            </td>
                            <td class="p-3 text-center">
                                {{ subject.semester_ambil }}
                            </td>
                            <td class="p-3 text-center">
                                <span v-if="subject.mod_elektif"
                                    >🌈 Elektif</span
                                >
                                <span v-else>🎓 Teras</span>
                            </td>
                            <td class="p-3 text-center">
                                <button
                                    v-if="subject.mod_elektif"
                                    class="text-blue-600 underline font-semibold hover:text-pink-500"
                                    @click="
                                        showElective(
                                            subject.id_kurikulum_subjek
                                        )
                                    "
                                >
                                    Detail 🌟
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                v-if="electiveDetail"
                class="border-t-2 border-blue-100 pt-3 text-base text-gray-700 mt-2 bg-blue-50/50 rounded-2xl px-4"
            >
                <div
                    class="mb-1 font-semibold text-blue-900 flex items-center gap-1"
                >
                    🌈 Detail Elektif:
                </div>
                <div>
                    <b>Kod Subjek:</b> {{ electiveDetail["se.kod_subjek"] }}
                </div>
                <div>
                    <b>Nama Subjek:</b> {{ electiveDetail["s.nama_subjek"] }}
                </div>
                <div><b>Kredit:</b> {{ electiveDetail["s.kredit"] }}</div>
            </div>
            <div v-if="loadingElective" class="text-xs text-blue-400 mt-2">
                Memuat detail elektif...
            </div>
        </div>
    </div>
</template>
