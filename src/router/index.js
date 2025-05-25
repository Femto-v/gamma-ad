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

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", component: Login },
    { path: "/main", name: "Main", component: Main },
    { path: "/timetable", name: "Timetable", component: Timetable},
    { path: "/ruang", name: "Ruang", component: Ruang},
    { path: "/subjek", name: "Subjek", component: Subjek},
    { path: "/pensyarah", name: "Pensyarah", component: Pensyarah},
    { path: "/pelajar", name: "Pelajar", component: Pelajar},
    { path: "/kurikulum", name: "Kurikulum", component: Kurikulum},
    { path: "/masaruang", name: "Masaruang", component: Masaruang},
    { path: "/analysissubjek", name: "AnalysiSubjek", component: AnalysisSubjek},
    { path: "/analysispelajar", name: "AnalysiPelajar", component: AnalysisPelajar},
    { path: "/clashruang", name: "ClashRuang", component: ClashRuang},
    { path: "/clashpelajar", name: "ClashPelajar", component: ClashPelajar},
    { path: "/clashpensyarah", name: "ClashPensyarah", component: ClashPensyarah},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 🔐 Navigation guard
router.beforeEach((to, from, next) => {
    const session = localStorage.getItem("web.fc.utm.my_usersession");

    if (to.path === "/main" && !session) {
        // Not logged in, redirect to login
        return next("/login");
    }

    next(); // proceed
});

export default router;
