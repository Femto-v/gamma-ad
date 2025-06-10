<script setup>
import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";
import KurikulumApi from "@/api/KurikulumApi.js";

const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const curricula = ref([]);
const searchTerm = ref("");
const loading = ref(false);
const error = ref("");

onMounted(async () => {
    loading.value = true;
    error.value = "";
    const api = new KurikulumApi();
    try {
        const sesiList = await api.getCurricula();
        console.log("Sesi List:", sesiList); // LOG

        // Fetch all cohort details in parallel
        const cohortPromises = sesiList.map((item) =>
            api
                .getCohort(item.sesi_masuk)
                .then((cohort) => {
                    console.log("Cohort for", item.sesi_masuk, ":", cohort); // LOG
                    // Only return valid curriculum info
                    if (
                        cohort &&
                        cohort.nama_kurikulum &&
                        cohort.sesi_masuk &&
                        cohort.semester_masuk &&
                        cohort.tahun_masuk
                    ) {
                        return {
                            name: cohort.nama_kurikulum,
                            sesi: cohort.sesi_masuk,
                            semester: cohort.semester_masuk,
                            tahun: cohort.tahun_masuk,
                            kod_kurikulum: cohort.kod_kurikulum,
                            id_kurikulum: cohort.id_kurikulum,
                        };
                    } else {
                        return null;
                    }
                })
                .catch((err) => {
                    console.warn(
                        `Cohort fetch failed for ${item.sesi_masuk}:`,
                        err
                    );
                    return null;
                })
        );
        curricula.value = (await Promise.all(cohortPromises)).filter(Boolean);
        if (!curricula.value.length) error.value = "No curriculum data found.";
        console.log("Curricula loaded:", curricula.value);
    } catch (err) {
        console.error("Fetch error:", err);
        error.value = "Failed to fetch curriculum data.";
        curricula.value = [];
    }
    loading.value = false;
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
                    <!-- SVG code unchanged -->
                    <input
                        v-model="searchTerm"
                        type="text"
                        placeholder="Search"
                        class="w-full outline-none border-0 bg-transparent text-base"
                    />
                </div>
            </div>
        </div>

        <!-- Loading & Error States -->
        <div v-if="loading" class="text-center text-lg text-gray-600 py-8">
            Loading...
        </div>
        <div v-else-if="error" class="text-center text-red-600 py-8">
            {{ error }}
        </div>

        <!-- Card List -->
        <div v-else class="flex flex-col gap-4 px-4 py-2">
            <div
                v-for="(item, index) in curricula.filter((i) =>
                    i.name.toLowerCase().includes(searchTerm.toLowerCase())
                )"
                :key="index"
                class="bg-blue-100 rounded-xl shadow p-4 relative"
            >
                <button
                    class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
                    title="Maklumat Jadual"
                >
                    <!-- Document Icon SVG unchanged -->
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
            </div>
            <div
                v-if="
                    !curricula.filter((i) =>
                        i.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length
                "
                class="text-center text-gray-500 py-8"
            >
                No curriculum found.
            </div>
        </div>
        <Footer />
    </div>
</template>
