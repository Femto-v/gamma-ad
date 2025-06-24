<script setup>
import { ref, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import KurikulumApi from "@/api/KurikulumApi.js";
import CurriculumCard from "./CurriculumCard.vue";
import CurriculumModal from "./CurriculumModal.vue";

const curricula = ref([]);
const curriculumSubjects = ref({});
const searchTerm = ref("");
const showModal = ref(false);
const modalSubjects = ref([]);
const modalCurriculumName = ref("");

onMounted(async () => {
    const api = new KurikulumApi();
    const sesiList = await api.getCurricula();
    const cohortArrays = await Promise.all(
        sesiList.map((item) =>
            api.getCohort(item.sesi_masuk).then((cohortResult) => {
                if (Array.isArray(cohortResult)) {
                    return cohortResult
                        .filter(
                            (cohort) =>
                                cohort &&
                                cohort.nama_kurikulum &&
                                cohort.sesi_masuk &&
                                cohort.semester_masuk &&
                                cohort.tahun_masuk
                        )
                        .map((cohort) => ({
                            name: cohort.nama_kurikulum,
                            sesi: cohort.sesi_masuk,
                            semester: cohort.semester_masuk,
                            tahun: cohort.tahun_masuk,
                            kod_kurikulum: cohort.kod_kurikulum,
                            id_kurikulum: cohort.id_kurikulum,
                        }));
                } else if (
                    cohortResult &&
                    cohortResult.nama_kurikulum &&
                    cohortResult.sesi_masuk &&
                    cohortResult.semester_masuk &&
                    cohortResult.tahun_masuk
                ) {
                    return [
                        {
                            name: cohortResult.nama_kurikulum,
                            sesi: cohortResult.sesi_masuk,
                            semester: cohortResult.semester_masuk,
                            tahun: cohortResult.tahun_masuk,
                            kod_kurikulum: cohortResult.kod_kurikulum,
                            id_kurikulum: cohortResult.id_kurikulum,
                        },
                    ];
                } else {
                    return [];
                }
            })
        )
    );
    curricula.value = cohortArrays.flat();

    // For each curriculum, fetch its subjects ONCE at the start
    for (const curr of curricula.value) {
        const subjek = await api.getSubjects(curr.id_kurikulum);
        curriculumSubjects.value[curr.id_kurikulum] = Array.isArray(subjek)
            ? subjek
            : [subjek];
    }
});

const filteredCurricula = computed(() => {
    if (!searchTerm.value) return curricula.value;
    return curricula.value.filter(
        (item) =>
            (item.name?.toLowerCase() ?? "").includes(
                searchTerm.value.toLowerCase()
            ) ||
            (item.sesi?.toLowerCase() ?? "").includes(
                searchTerm.value.toLowerCase()
            )
    );
});

// For counts per curriculum
function getTerasCount(id) {
    return (curriculumSubjects.value[id] || []).filter((s) => !s.mod_elektif)
        .length;
}
function getElektifCount(id) {
    return (curriculumSubjects.value[id] || []).filter((s) => s.mod_elektif)
        .length;
}
function getTotalCount(id) {
    return (curriculumSubjects.value[id] || []).length;
}

// Show modal with subject list
function openModal(curriculum) {
    modalCurriculumName.value = curriculum.name;
    modalSubjects.value =
        curriculumSubjects.value[curriculum.id_kurikulum] || [];
    showModal.value = true;
}
function closeModal() {
    showModal.value = false;
}
</script>

<template>
    <div class="bg-transparent min-h-screen">
        <Toggle />
        <ProfileBanner titleBanner="Curriculum" />

        <!-- Search Bar -->
        <div class="flex flex-col items-center">
            <div class="w-full max-w-lg relative px-4 my-4">
                <div
                    class="flex items-center bg-white rounded-2xl shadow px-4 py-2 border border-gray-300"
                >
                    <!-- Search SVG as before -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                            stroke="currentColor"
                            stroke-width="2"
                            fill="none"
                        />
                        <line
                            x1="21"
                            y1="21"
                            x2="16.65"
                            y2="16.65"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                    </svg>
                    <input
                        v-model="searchTerm"
                        type="text"
                        placeholder="Search"
                        class="w-full outline-none border-0 bg-transparent text-base"
                    />
                </div>
            </div>
        </div>

        <!-- Curriculum Cards -->
        <div class="flex flex-col gap-4 px-4 py-2">
            <CurriculumCard
                v-for="curr in filteredCurricula"
                :key="curr.id_kurikulum"
                :curriculum="curr"
                :terasCount="getTerasCount(curr.id_kurikulum)"
                :electiveCount="getElektifCount(curr.id_kurikulum)"
                :totalCount="getTotalCount(curr.id_kurikulum)"
                @show-detail="openModal"
            />
        </div>
        <CurriculumModal
            :show="showModal"
            :subjects="modalSubjects"
            :curriculumName="modalCurriculumName"
            @close="closeModal"
        />
        <Footer />
    </div>
</template>
