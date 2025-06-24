<script setup>
import {
    ref,
    onMounted,
    computed,
    nextTick,
    watch,
    onBeforeUnmount,
} from "vue";
import { useRouter } from "vue-router";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjekApi from "@/api/SubjekApi";
import SubjekPelajarApi from "@/api/SubjekPelajarApi";
import SessionService from "@/api/SessionService";
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
const router = useRouter();

const semesterApi = new SemesterApi();
const subjekApi = new SubjekApi();
const subjekPelajarApi = new SubjekPelajarApi();

// Sesi and Semester
const sesiOptions = ref([]);
const semesterOptions = ref(["1", "2"]);
const selectedSesi = ref("2024/2025");
const selectedSemester = ref("2");

// Infinite scroll & search
const searchTerm = ref("");
const INITIAL_LOAD = 3;
const LOAD_INCREMENT = 3;
const loadCount = ref(INITIAL_LOAD);
const loadingMore = ref(false);

// Modal for student list
const showModal = ref(false);
const modalSubject = ref(null);
const modalStudentList = ref([]);
const modalLoading = ref(false);
const modalError = ref(null);

const subjectOptions = computed(() => {
    const set = new Set();
    subjectRows.value.forEach((row) => {
        if (row.code && row.name) set.add(`${row.code} - ${row.name}`);
        else if (row.code) set.add(row.code);
        else if (row.name) set.add(row.name);
    });
    return ["All", ...Array.from(set)];
});

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
    fetchSesiSemesterOptions();
});
onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleWindowScroll);
});

async function fetchSesiSemesterOptions() {
    try {
        const sesiSemesterData =
            (await semesterApi.getAllSemesterInfo?.()) ||
            (await semesterApi.getCurrentSemesterInfo());
        if (Array.isArray(sesiSemesterData) && sesiSemesterData.length) {
            sesiOptions.value = [
                ...new Set(sesiSemesterData.map((item) => item.sesi)),
            ];
            // Default: sesi "2024/2025" if available, else first
            selectedSesi.value = sesiOptions.value.includes("2024/2025")
                ? "2024/2025"
                : sesiOptions.value[0];
            selectedSemester.value = "2";
            await fetchSubjects();
        }
    } catch (err) {
        error.value = "Gagal mendapatkan data sesi & semester.";
        sesiOptions.value = [];
    }
}

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

watch([selectedSesi, selectedSemester], () => {
    fetchSubjects();
});

// =======================
// Student modal function
// =======================
async function handleShowPelajar(subject) {
    modalSubject.value = subject;
    modalStudentList.value = [];
    modalLoading.value = true;
    modalError.value = null;
    showModal.value = true;

    try {
        // Validate session first
        let sessionObj = await SessionService.validateSession();
        if (!sessionObj || !sessionObj.session_id) {
            // Redirect to login
            modalLoading.value = false;
            showModal.value = false;
            router.push("/login");
            return;
        }
        const session_id = sessionObj.session_id;

        const result = await subjekPelajarApi.getSubjekPelajar({
            session_id,
            sesi: selectedSesi.value,
            semester: selectedSemester.value,
            kod_subjek: subject.code,
            seksyen: subject.seksyen,
        });

        if (Array.isArray(result)) {
            modalStudentList.value = result;
        } else if (result && typeof result === "object") {
            modalStudentList.value = [result];
        } else {
            modalStudentList.value = [];
        }
    } catch (e) {
        console.error("Error fetching student list:", e);
        modalError.value = "Gagal mendapatkan data pelajar.";
        modalStudentList.value = [];
    } finally {
        modalLoading.value = false;
    }
}
function handleCloseModal() {
    showModal.value = false;
    modalSubject.value = null;
    modalStudentList.value = [];
}
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
            <div class="flex flex-wrap gap-4 justify-center px-4 py-2">
                <div class="flex items-center gap-2">
                    <span class="font-medium text-blue-800">📕 Subject:</span>
                    <select
                        v-model="selectedSubject"
                        class="px-2 py-1 border-2 border-blue-200 rounded-lg w-52 focus:ring-2 focus:ring-blue-300"
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
                        <div
                            class="font-bold text-xl text-blue-900 mb-1 flex items-center gap-2"
                        >
                            {{ subject.code }}
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
                        <!-- Button to view students -->
                        <div class="mt-2 flex justify-end">
                            <button
                                @click="handleShowPelajar(subject)"
                                title="Lihat Senarai Pelajar"
                                class="px-5 py-2 bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2 border border-blue-400/20 transition hover:from-blue-600 hover:to-blue-800 hover:scale-105 hover:shadow-blue-300/40 active:scale-95 active:bg-blue-900 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none duration-200"
                            >
                                <span class="text-xl">👥</span>
                                <span>Pelajar</span>
                            </button>
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
            <!-- Student Modal -->
            <div
                v-if="showModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm bg-opacity-40"
                @click.self="handleCloseModal"
            >
                <div
                    class="bg-white max-w-lg w-full rounded-2xl shadow-lg p-6 relative"
                >
                    <button
                        @click="handleCloseModal"
                        class="absolute top-2 right-2 text-gray-500 hover:text-red-600 rounded-full bg-gray-100 p-1"
                        title="Close"
                    >
                        ✖️
                    </button>
                    <div
                        class="font-bold text-lg text-blue-700 mb-2 flex gap-2 items-center"
                    >
                        👥 Pelajar - {{ modalSubject?.code }} (Seksyen
                        {{ modalSubject?.seksyen }})
                    </div>
                    <div
                        v-if="modalLoading"
                        class="py-4 text-center text-blue-400"
                    >
                        Loading...
                    </div>
                    <div
                        v-else-if="modalError"
                        class="py-4 text-center text-red-500"
                    >
                        {{ modalError }}
                    </div>
                    <div
                        v-else-if="modalStudentList.length === 0"
                        class="py-4 text-center text-gray-500"
                    >
                        Tiada pelajar dijumpai.
                    </div>
                    <div
                        v-else
                        class="overflow-auto max-h-96 flex flex-col gap-3"
                    >
                        <div
                            v-for="(student, idx) in modalStudentList"
                            :key="student.no_matrik"
                            class="flex gap-3 items-center bg-gradient-to-tr from-blue-50 via-white to-blue-100 rounded-xl shadow border border-blue-200 px-4 py-3 transition hover:shadow-lg"
                        >
                            <div class="flex-shrink-0">
                                <span
                                    class="inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-700 w-10 h-10 text-2xl font-bold border border-blue-300"
                                >
                                    {{ idx + 1 }}
                                </span>
                            </div>
                            <div class="flex-1">
                                <div
                                    class="font-semibold text-blue-800 text-lg flex items-center gap-1"
                                >
                                    <span class="text-xl">🆔</span>
                                    {{ student.no_matrik }}
                                </div>
                                <div
                                    class="text-base font-bold text-gray-800 mb-1 flex items-center gap-1"
                                >
                                    <span class="text-lg">👤</span>
                                    {{ student.nama }}
                                </div>
                                <div class="flex flex-wrap gap-2 text-sm mt-1">
                                    <span
                                        class="px-2 py-0.5 bg-green-100 border border-green-300 text-green-700 rounded-full flex items-center gap-1"
                                    >
                                        <span>🎯 Status:</span>
                                        <b>{{ student.status || "-" }}</b>
                                    </span>
                                    <span
                                        class="px-2 py-0.5 bg-purple-100 border border-purple-300 text-purple-800 rounded-full flex items-center gap-1"
                                    >
                                        <span>🏛️ Fakulti:</span>
                                        <b>{{ student.kod_fakulti || "-" }}</b>
                                    </span>
                                    <span
                                        class="px-2 py-0.5 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-full flex items-center gap-1"
                                    >
                                        <span>📅 Tahun:</span>
                                        <b>{{ student.tahun_kursus || "-" }}</b>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>
