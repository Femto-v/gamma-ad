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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
        <div
            class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] relative flex flex-col"
            @click.stop
        >
            <!-- Make close button always visible -->
            <button
                @click="close"
                class="absolute top-2 right-3 text-lg bg-gray-200 rounded-full px-2 py-1 hover:bg-gray-300 z-10"
                style="line-height: 1"
            >
                ✕
            </button>

            <h3 class="font-bold text-xl mb-2 pr-10">
                Subjects - {{ curriculumName }}
            </h3>

            <!-- Table is scrollable if content is too large -->
            <div
                class="overflow-x-auto overflow-y-auto flex-1"
                style="max-height: 60vh"
            >
                <table class="w-full mb-4">
                    <thead>
                        <tr class="border-b sticky top-0 bg-white z-5">
                            <th class="text-left p-2">Code</th>
                            <th class="text-left p-2">Name</th>
                            <th class="text-left p-2">Credit</th>
                            <th class="text-left p-2">Year</th>
                            <th class="text-left p-2">Semester</th>
                            <th class="text-left p-2">Type</th>
                            <th class="text-left p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="subject in subjects"
                            :key="subject.id_kurikulum_subjek"
                            class="border-b"
                        >
                            <td class="p-2 whitespace-nowrap">
                                {{ subject.kod_subjek }}
                            </td>
                            <td class="p-2">{{ subject.nama_subjek }}</td>
                            <td class="p-2">{{ subject.kredit }}</td>
                            <td class="p-2">{{ subject.tahun_ambil }}</td>
                            <td class="p-2">{{ subject.semester_ambil }}</td>
                            <td class="p-2">
                                <span v-if="subject.mod_elektif">Elektif</span>
                                <span v-else>Teras</span>
                            </td>
                            <td class="p-2">
                                <button
                                    v-if="subject.mod_elektif"
                                    class="text-blue-600 underline"
                                    @click="
                                        showElective(
                                            subject.id_kurikulum_subjek
                                        )
                                    "
                                >
                                    Lihat Detail Elektif
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                v-if="electiveDetail"
                class="border-t pt-3 text-sm text-gray-700"
            >
                <div class="mb-1 font-semibold">Detail Elektif:</div>
                <div>Kod Subjek: {{ electiveDetail["se.kod_subjek"] }}</div>
                <div>Nama Subjek: {{ electiveDetail["s.nama_subjek"] }}</div>
                <div>Kredit: {{ electiveDetail["s.kredit"] }}</div>
            </div>
            <div v-if="loadingElective" class="text-xs text-gray-400">
                Memuat detail elektif...
            </div>
        </div>
    </div>
</template>
