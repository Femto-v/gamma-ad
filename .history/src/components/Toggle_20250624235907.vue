<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import SessionService from "@/api/SessionService";
const sidebarOpen = ref(false);
const analysisOpen = ref(false);
import AppIcon from "./AppIcon.vue";
const error = ref(null); //Buat error
const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
});

//button function
const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
};

const loadMain = () => {
    toggleSidebar();
    window.location.href = "/main";
};

const loadTimetable = () => {
    toggleSidebar();
    window.location.href = "/timetable";
};

const loadRuang = () => {
    toggleSidebar();
    window.location.href = "/ruang";
};

const loadSubjek = () => {
    toggleSidebar();
    window.location.href = "/subjek";
};

const loadPensyarah = () => {
    toggleSidebar();
    window.location.href = "/pensyarah";
};

const loadPelajar = () => {
    toggleSidebar();
    window.location.href = "/pelajar";
};

const loadKurikulum = () => {
    toggleSidebar();
    window.location.href = "/kurikulum";
};

const logout = () => {
    SessionService.clearSession();
    window.location.replace("/login");
};

//Analysis dropdown menu
const loadMasaruang = () => {
    toggleSidebar();
    window.location.href = "/masaruang";
};

const loadAnalysisSubjek = () => {
    toggleSidebar();
    window.location.href = "/analysissubjek";
};

const loadAnalysisPelajar = () => {
    toggleSidebar();
    window.location.href = "/analysispelajar";
};

const loadClashRuang = () => {
    toggleSidebar();
    window.location.href = "/clashruang";
};

const loadClashPensyarah = () => {
    toggleSidebar();
    window.location.href = "/clashpensyarah";
};

const loadClashPelajar = () => {
    toggleSidebar();
    window.location.href = "/clashpelajar";
};

//error try catch
const fetchWithErrorHandler = async (apiCall) => {
    try {
        error.value = null; // reset previous error
        const result = await apiCall();
        return result;
    } catch (err) {
        error.value = "Failed to Fetch Data: " + (err.message || err);
        console.error("[Fetch Error]", err);
        // You can also show toast here if you use a toast library
        return null;
    }
};
</script>

Internal server error: Cannot apply unknown utility class `gap-3`. Are you using
CSS modules or similar and missing `@reference`?
https://tailwindcss.com/docs/functions-and-directives#reference-directive
