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
    <div
        class="bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 min-h-screen pb-10"
    >
        <Toggle />
        <ProfileBanner titleBanner="Curriculum" />

        <!-- Search Bar -->
        <div class="flex flex-col items-center">
            <div class="w-full max-w-lg relative px-4 my-4">
                <div
                    class="flex items-center bg-white/90 rounded-2xl shadow-lg px-4 py-2 border-2 border-blue-200"
                >
                    <span class="text-2xl mr-2">🔎</span>
                    <input
                        v-model="searchTerm"
                        type="text"
                        placeholder="Search curriculum, session, etc."
                        class="w-full outline-none border-0 bg-transparent text-base font-semibold tracking-wide placeholder:text-blue-300"
                    />
                </div>
            </div>
        </div>

        <!-- Curriculum Cards -->
        <div class="flex flex-col gap-6 px-4 py-2 max-w-2xl mx-auto">
            <TransitionGroup name="curriculum-pop" tag="div">
                <CurriculumCard
                    v-for="curr in filteredCurricula"
                    :key="curr.id_kurikulum"
                    :curriculum="curr"
                    :terasCount="getTerasCount(curr.id_kurikulum)"
                    :electiveCount="getElektifCount(curr.id_kurikulum)"
                    :totalCount="getTotalCount(curr.id_kurikulum)"
                    @show-detail="openModal"
                />
            </TransitionGroup>
            <div
                v-if="filteredCurricula.length === 0"
                class="text-center text-blue-300 text-xl font-bold py-16"
            >
                <span class="text-3xl">🤔</span> <br />No curriculum found.
            </div>
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

<style scoped>
.curriculum-pop-enter-active,
.curriculum-pop-leave-active {
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.curriculum-pop-enter-from,
.curriculum-pop-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
}
</style>
