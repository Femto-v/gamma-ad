<script setup>
import { ref, onMounted, computed } from "vue";
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
        // Defensive: filter duplicates by sesi_masuk
        const uniqueSesi = Array.from(
            new Set(sesiList.map((s) => s.sesi_masuk))
        );
        const cohortPromises = uniqueSesi.map(async (sesi_masuk) => {
            try {
                const cohort = await api.getCohort(sesi_masuk);
                // You can add a check for cohort success here
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
                        // Optional dummy values
                        teras: "-",
                        elektif: "-",
                        jumlah: "-",
                    };
                }
            } catch (e) {
                console.warn(`Cohort fetch failed for ${sesi_masuk}:`, e);
            }
            return null;
        });
        curricula.value = (await Promise.all(cohortPromises)).filter(Boolean);
        if (!curricula.value.length) error.value = "No curriculum data found.";
    } catch (err) {
        console.error("Fetch error:", err);
        error.value = "Failed to fetch curriculum data.";
        curricula.value = [];
    }
    loading.value = false;
});

// Filtered list for search
const filteredCurricula = computed(() => {
    if (!searchTerm.value) return curricula.value;
    return curricula.value.filter((item) =>
        (item.name || "").toLowerCase().includes(searchTerm.value.toLowerCase())
    );
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
                v-for="(item, index) in curricula"
                :key="index"
                class="bg-blue-100 rounded-xl shadow p-4 relative"
            >
                <!-- Top right icon button -->
                <button
                    class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
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
                <!-- You can add teras/elektif/jumlah below if you want -->

                <div class="flex flex-row gap-x-6 text-gray-600 text-xs mt-1">
                    <div>Teras: {{ item.teras }}</div>
                    <div>Elektif: {{ item.elektif }}</div>
                    <div>Jumlah: {{ item.jumlah }}</div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>
