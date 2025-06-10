<script setup>
const curricula = ref([]);
const searchTerm = ref("");
const subjectMap = ref({}); // id_kurikulum: { teras: X, elektif: Y, total: Z, subjects: [] }
const showModal = ref(false);
const selectedSubjects = ref([]);

function openModal(curId) {
    selectedSubjects.value = subjectMap.value[curId]?.subjects || [];
    showModal.value = true;
}
function closeModal() {
    showModal.value = false;
    selectedSubjects.value = [];
}

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

onMounted(async () => {
    const api = new KurikulumApi();
    try {
        const sesiList = await api.getCurricula();

        const cohortArrays = await Promise.all(
            sesiList.map((item) =>
                api
                    .getCohort(item.sesi_masuk)
                    .then((cohortResult) => {
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
                    .catch(() => [])
            )
        );
        curricula.value = cohortArrays.flat();

        // Fetch subject info for each curriculum
        await Promise.all(
            curricula.value.map(async (cur) => {
                try {
                    const subs = await api.getSubjects(cur.id_kurikulum);
                    let teras = 0,
                        elektif = 0;
                    for (let s of subs) {
                        if (
                            s.nama_elektif ||
                            s.mod_elektif // You can refine this logic as needed
                        ) {
                            elektif++;
                        } else {
                            teras++;
                        }
                    }
                    subjectMap.value[cur.id_kurikulum] = {
                        teras,
                        elektif,
                        total: teras + elektif,
                        subjects: subs,
                    };
                } catch {
                    subjectMap.value[cur.id_kurikulum] = {
                        teras: 0,
                        elektif: 0,
                        total: 0,
                        subjects: [],
                    };
                }
            })
        );
    } catch (err) {
        console.error("Fetch error:", err);
        curricula.value = [];
    }
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <!-- Banner -->
        <ProfileBanner titleBanner="Curriculum" />

        <!-- Search Bar -->
        <div class="flex flex-col items-center">
            <div class="w-full max-w-lg relative px-4 my-4">
                <div
                    class="flex items-center bg-white rounded-2xl shadow px-4 py-2 border border-gray-300"
                >
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

        <!-- Card List -->
        <div class="flex flex-col gap-4 px-4 py-2">
            <div
                v-for="(item, index) in filteredCurricula"
                :key="index"
                class="bg-blue-100 rounded-xl shadow p-4 relative"
            >
                <!-- Top right icon button -->
                <button
                    class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
                    @click="openModal(item.id_kurikulum)"
                    title="Maklumat Jadual"
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
                <!-- Curriculum Info -->
                <div class="font-semibold text-lg mt-2 mb-1">
                    {{ item.name }}
                </div>
                <div class="mb-1 text-base">
                    <span class="font-light">Admission Start Information:</span>
                </div>
                <div
                    class="flex flex-row flex-wrap items-center gap-x-6 text-gray-700 text-sm mb-1"
                >
                    <div>Session: {{ item.sesi }}</div>
                    <div>Semester: {{ item.semester }}</div>
                    <div>Year: {{ item.tahun }}</div>
                </div>
                <div class="flex gap-4 mt-2 text-sm">
                    <div>
                        Teras: {{ subjectMap[item.id_kurikulum]?.teras ?? "-" }}
                    </div>
                    <div>
                        Elektif:
                        {{ subjectMap[item.id_kurikulum]?.elektif ?? "-" }}
                    </div>
                    <div>
                        Total: {{ subjectMap[item.id_kurikulum]?.total ?? "-" }}
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>
