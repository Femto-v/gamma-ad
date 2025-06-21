import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login.vue";
import Main from "@/views/Main.vue";
import Timetable from "@/views/Timetable.vue";
import Ruang from "@/views/Ruang.vue";
import Subjek from "@/views/Subjek.vue";
import Pensyarah from "@/views/Pensyarah.vue";
import Pelajar from "@/views/Pelajar.vue";
import Kurikulum from "@/views/Kurikulum.vue";
import Masaruang from "@/views/Masaruang.vue";
import AnalysisSubjek from "@/views/AnalysisSubjek.vue";
import AnalysisPelajar from "@/views/AnalysisPelajar.vue";
import ClashRuang from "@/views/ClashRuang.vue";
import ClashPelajar from "@/views/ClashPelajar.vue";
import ClashPensyarah from "@/views/ClashPensyarah.vue";
import SessionService from "@/api/SessionService";

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", component: Login },
    {
        path: "/main",
        name: "Main",
        component: Main,
        meta: { requiresAuth: true },
    },
    {
        path: "/timetable",
        name: "Timetable",
        component: Timetable,
        meta: { requiresAuth: true },
    },
    {
        path: "/ruang",
        name: "Ruang",
        component: Ruang,
        meta: { requiresAuth: true },
    },
    {
        path: "/subjek",
        name: "Subjek",
        component: Subjek,
        meta: { requiresAuth: true },
    },
    {
        path: "/pensyarah",
        name: "Pensyarah",
        component: Pensyarah,
        meta: { requiresAuth: true },
    },
    {
        path: "/pelajar",
        name: "Pelajar",
        component: Pelajar,
        meta: { requiresAuth: true },
    },
    {
        path: "/kurikulum",
        name: "Kurikulum",
        component: Kurikulum,
        meta: { requiresAuth: true },
    },
    {
        path: "/masaruang",
        name: "Masaruang",
        component: Masaruang,
        meta: { requiresAuth: true },
    },
    {
        path: "/analysissubjek",
        name: "AnalysiSubjek",
        component: AnalysisSubjek,
        meta: { requiresAuth: true },
    },
    {
        path: "/analysispelajar",
        name: "AnalysiPelajar",
        component: AnalysisPelajar,
        meta: { requiresAuth: true },
    },
    {
        path: "/clashruang",
        name: "ClashRuang",
        component: ClashRuang,
        meta: { requiresAuth: true },
    },
    {
        path: "/clashpelajar",
        name: "ClashPelajar",
        component: ClashPelajar,
        meta: { requiresAuth: true },
    },
    {
        path: "/clashpensyarah",
        name: "ClashPensyarah",
        component: ClashPensyarah,
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Helper to read cookie
function getCookie(name) {
    const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
}

router.beforeEach((to, from, next) => {
    const session =
        localStorage.getItem("web.fc.utm.my_usersession") ||
        getCookie("session_id");
    if (to.meta.requiresAuth && !session) {
        return next("/login");
    }
    if (to.path === "/login" && session) {
        return next("/main");
    }
    next();
});

export default router;
