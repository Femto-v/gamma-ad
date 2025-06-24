<script setup>
import {
    ref,
    onMounted,
    computed,
    nextTick,
    watch,
    onBeforeUnmount,
} from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjekApi from "@/api/SubjekApi";
import { userName, userMatric } from "@/constants/ApiConstants.js";
import Footer from "@/components/Footer.vue";

// User info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

const selectedKurikulum = ref("All");
const selectedSubject = ref("All");
const subjectRows = ref([]);
const error = ref(null);

const semesterApi = new SemesterApi();
const subjekApi = new SubjekApi();

// Sesi and Semester
const sesiOptions = ref([]);
const semesterOptions = ref([]);
const selectedSesi = ref("");
const selectedSemester = ref("");

// Infinite scroll & search
const searchTerm = ref("");
const INITIAL_LOAD = 3;
const LOAD_INCREMENT = 3;
const loadCount = ref(INITIAL_LOAD);
const loadingMore = ref(false);

// Subject dropdown
const subjectOptions = computed(() => {
    const set = new Set();
    subjectRows.value.forEach((row) => {
        if (row.code && row.name) set.add(`${row.code} - ${row.name}`);
        else if (row.code) set.add(row.code);
        else if (row.name) set.add(row.name);
    });
    return ["All", ...Array.from(set)];
});

// Filtered subjects
const filteredSubjects = computed(() => {
    let arr = subjectRows.value;
    if (selectedSubject.value && selectedSubject.value !== "All") {
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

// Infinite scroll
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
watch([searchTerm, selectedSubject, subjectRows], () => {
    loadCount.value = INITIAL_LOAD;
});

function handleWindowScroll() {
    const nearBottom = 100;
    if (
        window.innerHeight + window.scrollY >=
            document.body.offsetHeight - nearBottom &&
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

onMounted(() => {
    window.addEventListener("scroll", handleWindowScroll);
    // Load sesi/semester options
    fetchSesiSemesterOptions();
});
onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleWindowScroll);
});

// Fetch all sesi/semester options (assume SemesterApi has getAllSemesterInfo)
async function fetchSesiSemesterOptions() {
    try {
        const sesiSemesterData =
            (await semesterApi.getAllSemesterInfo?.()) ||
            (await semesterApi.getCurrentSemesterInfo());
        if (Array.isArray(sesiSemesterData) && sesiSemesterData.length) {
            // Only allow sesi "2024/2025"
            sesiOptions.value = [
                ...new Set(sesiSemesterData.map((item) => item.sesi)),
            ];
            // Only allow semester 1 and 2 as string
            semesterOptions.value = ["1", "2"];

            // Set default: sesi "2024/2025", semester "2" (or "1" if you prefer)
            selectedSesi.value = "2024/2025";
            selectedSemester.value = "2";

            // Initial subject load
            await fetchSubjects();
        }
    } catch (err) {
        error.value = "Gagal mendapatkan data sesi & semester.";
        sesiOptions.value = [];
        semesterOptions.value = [];
    }
}

// Fetch subjects for selected sesi & semester
async function fetchSubjects() {
    if (!selectedSesi.value || !selectedSemester.value) return;
    error.value = null;
    subjectRows.value = [];
    try {
        const subjectData = await subjekApi.getSubjectSections(
            selectedSesi.value,
            selectedSemester.value
        );
        if (Array.isArray(subjectData)) {
            subjectRows.value = subjectData.flatMap((subj) =>
                (Array.isArray(subj.seksyen_list) ? subj.seksyen_list : []).map(
                    (section) => ({
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
                    })
                )
            );
        } else {
            subjectRows.value = [];
        }
        nextTick(() => {
            const scroller = document.getElementById("subjek-scroll-list");
            if (scroller) scroller.addEventListener("scroll", handleScroll);
        });
    } catch (err) {
        error.value = "Gagal mendapatkan data subjek.";
        subjectRows.value = [];
    }
}

// When sesi/semester changed, reload subjects
watch([selectedSesi, selectedSemester], () => {
    fetchSubjects();
});
</script>

<template>
    <div
        class="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen"
    >
        <Toggle />

        <main>
            <ProfileBanner titleBanner="📚 Subject List 📚" />

            <!-- Sesi & Semester Selectors -->
            <div class="flex flex-wrap gap-4 justify-center mt-4 mb-2 px-4">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-blue-800"
                        >🗓️ Session (Sesi):</span
                    >
                    <select
                        v-model="selectedSesi"
                        class="px-2 py-1 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300"
                    >
                        <option
                            v-for="sesi in sesiOptions"
                            :key="sesi"
                            :value="sesi"
                        >
                            {{ sesi }}
                        </option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-medium text-blue-800">📆 Semester:</span>
                    <select
                        v-model="selectedSemester"
                        class="px-2 py-1 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300"
                    >
                        <option
                            v-for="sem in semesterOptions"
                            :key="sem"
                            :value="sem"
                        >
                            {{ sem }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-4 justify-center px-4 pb-2">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-blue-800">📕 Subject:</span>
                    <select
                        v-model="selectedSubject"
                        class="px-2 py-1 border-2 border-blue-200 rounded-lg w-auto focus:ring-2 focus:ring-blue-300"
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
            <!-- Search Bar -->
            <div class="flex flex-col items-center">
                <div class="w-full max-w-lg relative px-4 m-4">
                    <div
                        class="flex items-center bg-white rounded-2xl shadow px-4 py-2 border-2 border-blue-200 focus-within:ring-2 ring-blue-300"
                    >
                        <span class="mr-2 text-blue-400 text-lg">🔍</span>
                        <input
                            v-model="searchTerm"
                            type="text"
                            placeholder="Cari subjek, pensyarah, atau kod..."
                            class="w-full outline-none border-0 bg-transparent text-base"
                        />
                    </div>
                </div>
            </div>

            <!-- Card List -->
            <div class="flex flex-col items-center">
                <div
                    id="subjek-scroll-list"
                    class="flex flex-col gap-6 px-4 py-2 max-w-xl w-full mx-auto overflow-y-auto"
                >
                    <div
                        v-for="(subject, index) in visibleSubjects"
                        :key="index"
                        class="rounded-2xl shadow-xl p-5 relative border-2 border-blue-200 bg-gradient-to-tr from-white via-blue-50 to-blue-100 hover:shadow-2xl transition duration-200 group"
                    >
                        <!-- Info Button -->
                        <button
                            class="absolute top-3 right-3 rounded-lg bg-blue-50 hover:bg-blue-200 p-2 shadow text-blue-600"
                            title="Maklumat Jadual"
                        >
                            <span class="text-lg">ℹ️</span>
                        </button>
                        <div
                            class="font-bold text-xl text-blue-900 mb-1 flex items-center gap-2"
                        >
                            {{ subject.code }}
                            <!-- Circle badge for shortCode -->
                            <span
                                class="inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-500 w-7 h-7 text-base font-semibold ml-1 border border-gray-300"
                                :title="
                                    subject.shortCode === '-'
                                        ? 'No faculty code'
                                        : subject.shortCode
                                "
                            >
                                {{ subject.shortCode }}
                            </span>
                        </div>
                        <div
                            class="text-base font-semibold mb-1 text-gray-900 flex items-center gap-2"
                        >
                            {{ subject.name }}
                        </div>
                        <div class="flex flex-wrap gap-2 mb-1">
                            <span
                                class="px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs rounded-full"
                            >
                                🎓 Credit: <b>{{ subject.kredit }}</b>
                            </span>
                            <span
                                class="px-3 py-1 bg-purple-100 border border-purple-300 text-purple-800 text-xs rounded-full"
                            >
                                🏷️ Section: <b>{{ subject.seksyen ?? "-" }}</b>
                            </span>
                            <span
                                class="px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-xs rounded-full"
                            >
                                👨‍🏫 Lecturer:
                                <b>{{ subject.drPensyarah ?? "-" }}</b>
                            </span>
                            <span
                                class="px-3 py-1 bg-blue-100 border border-blue-300 text-blue-800 text-xs rounded-full"
                            >
                                🧑‍🎓 Student:
                                <b>{{ subject.bilPelajar ?? "-" }}</b>
                            </span>
                        </div>
                    </div>
                    <div
                        v-if="loadingMore"
                        class="py-2 text-center text-blue-400 text-base animate-pulse"
                    >
                        ⏳ Loading more...
                    </div>
                    <div
                        v-if="!visibleSubjects.length && !error"
                        class="py-10 text-center text-blue-300 text-base"
                    >
                        <span class="text-3xl">🙈</span><br />
                        No Subject Found.
                    </div>
                    <div
                        v-if="error"
                        class="py-10 text-center text-red-500 text-base"
                    >
                        <span class="text-2xl">⚠️</span><br />
                        {{ error }}
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>
