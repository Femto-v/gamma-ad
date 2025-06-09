<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { onMounted, onBeforeUnmount } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjekApi from "@/api/SubjekApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import Footer from "@/components/Footer.vue";

// Set user info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const selectedKurikulum = ref("Semua");
const selectedSubject = ref("Semua");
const subjectRows = ref([]);
const error = ref(null);

const semesterApi = new SemesterApi();
const subjekApi = new SubjekApi();

const currentSession = ref("");
const currentSemester = ref("");

// Search and infinite scroll
const searchTerm = ref("");
const INITIAL_LOAD = 3;
const LOAD_INCREMENT = 3;
const loadCount = ref(INITIAL_LOAD); // Show 3 at first
const loadingMore = ref(false);

// Extracted subject codes/names for dropdown filter
const subjectOptions = computed(() => {
    const set = new Set();
    subjectRows.value.forEach((row) => {
        if (row.code && row.name) set.add(`${row.code} - ${row.name}`);
        else if (row.code) set.add(row.code);
        else if (row.name) set.add(row.name);
    });
    return ["Semua", ...Array.from(set)];
});

onMounted(async () => {
    try {
        const sessionData = await semesterApi.getCurrentSemesterInfo();
        if (sessionData.length > 0) {
            currentSession.value = sessionData[0].sesi;
            currentSemester.value = sessionData[0].semester;

            const subjectData = await subjekApi.getSubjectSections(
                currentSession.value,
                currentSemester.value
            );

            if (Array.isArray(subjectData)) {
                subjectRows.value = subjectData.flatMap((subj) =>
                    (Array.isArray(subj.seksyen_list)
                        ? subj.seksyen_list
                        : []
                    ).map((section) => ({
                        code: subj.kod_subjek,
                        name: subj.nama_subjek,
                        shortCode: subj.kod_fakulti ?? "-",
                        kredit: subj.kredit ?? 0,
                        seksyen: section.seksyen,
                        drPensyarah: section.pensyarah,
                        bilPelajar: section.bil_pelajar,
                        bilSeksyen:
                            subj.bil_seksyen ?? subj.seksyen_list?.length ?? 0,
                        bilPensyarah:
                            subj.bil_pensyarah ??
                            new Set(
                                (subj.seksyen_list ?? []).map(
                                    (s) => s.pensyarah
                                )
                            ).size,
                    }))
                );
            } else {
                subjectRows.value = [];
            }
        }
        // ADD WINDOW SCROLL LISTENER HERE
        window.addEventListener("scroll", handleWindowScroll);
    } catch (err) {
        error.value = "Gagal mendapatkan data subjek.";
        console.error("[ERROR] Failed to fetch subject data:", err);
    }
});

// REMOVE LISTENER WHEN COMPONENT UNMOUNTS
onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleWindowScroll);
});

// Filtering logic (Kod/Nama Subjek and search)
const filteredSubjects = computed(() => {
    let arr = subjectRows.value;
    if (selectedSubject.value && selectedSubject.value !== "Semua") {
        const [filterCode] = selectedSubject.value.split(" - ");
        arr = arr.filter((row) => row.code === filterCode);
    }
    const q = searchTerm.value.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
        (s) =>
            (s.code && s.code.toLowerCase().includes(q)) ||
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.shortCode && s.shortCode.toLowerCase().includes(q)) ||
            (s.seksyen && String(s.seksyen).toLowerCase().includes(q)) ||
            (s.drPensyarah && s.drPensyarah.toLowerCase().includes(q))
    );
});

const visibleSubjects = computed(() =>
    filteredSubjects.value.slice(0, loadCount.value)
);

// Infinite scroll handler (3 at a time)
function handleScroll() {
    const scroller = document.getElementById("subjek-scroll-list");
    if (!scroller) return;
    if (
        scroller.scrollTop + scroller.clientHeight >=
            scroller.scrollHeight - 50 &&
        !loadingMore.value
    ) {
        if (loadCount.value < filteredSubjects.value.length) {
            loadingMore.value = true;
            setTimeout(() => {
                loadCount.value += LOAD_INCREMENT;
                loadingMore.value = false;
            }, 250);
        }
    }
}

// Reset scroll when filter/search changes
watch([searchTerm, selectedSubject, subjectRows], () => {
    loadCount.value = INITIAL_LOAD;
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <main>
            <ProfileBanner titleBanner="Subject" />

            <!-- Search Bar -->
            <div class="flex flex-col items-center">
                <div class="w-full max-w-lg relative px-4 mb-4">
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

            <!-- Filters -->
            <div class="grid items-center gap-3 px-4 pb-2 justify-center">
                <div>
                    Curriculum:
                    <select
                        v-model="selectedKurikulum"
                        class="ml-1 px-2 py-1 border rounded"
                    >
                        <option value="Semua">All</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                </div>
                <div>
                    Subject Code/Name:
                    <select
                        v-model="selectedSubject"
                        class="ml-1 px-2 py-1 border rounded w-48"
                    >
                        <option
                            v-for="(option, i) in subjectOptions"
                            :key="i"
                            :value="option"
                        >
                            {{ option }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Card List (Infinite Scroll Area) -->
            <div class="flex flex-col items-center">
                <div
                    id="subjek-scroll-list"
                    class="flex flex-col gap-4 px-4 py-2 max-w-lg w-full mx-auto overflow-y-auto"
                >
                    <div
                        v-for="(subject, index) in visibleSubjects"
                        :key="index"
                        class="bg-blue-100 rounded-xl shadow p-4 relative transition"
                    >
                        <button
                            class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
                            title="Maklumat Jadual"
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
                        </button>
                        <div class="font-semibold text-lg">
                            {{ subject.code }}
                        </div>
                        <div class="text-xl font-normal mb-1">
                            {{ subject.name }}
                        </div>
                        <div
                            class="flex justify-between text-gray-700 mb-2 text-sm"
                        >
                            <div>{{ subject.shortCode }}</div>
                            <div>credit: {{ subject.kredit }}</div>
                        </div>
                        <div class="flex gap-4 text-gray-700 text-[15px]">
                            <div>
                                Num. of Section: {{ subject.seksyen ?? "-" }}
                            </div>
                            <div>
                                Num. of Lecturer:
                                {{ subject.drPensyarah ?? "-" }}
                            </div>
                            <div>
                                Num. of Student: {{ subject.bilPelajar ?? "-" }}
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="loadingMore"
                        class="py-2 text-center text-gray-400 text-sm"
                    >
                        Loading more...
                    </div>
                    <div
                        v-if="!visibleSubjects.length && !error"
                        class="py-10 text-center text-gray-400 text-base"
                    >
                        No Subject Found.
                    </div>
                    <div
                        v-if="error"
                        class="py-10 text-center text-red-500 text-base"
                    >
                        {{ error }}
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>
