import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Main from "@/views/Main.vue";
import Timetable from "@/views/Timetable.vue";
import Ruang from "@/views/Ruang.vue";
import Subjek from "@/views/Subjek.vue";
import Pensyarah from "@/views/Pensyarah.vue";
import Pelajar from "@/views/Pelajar.vue";
import Kurikulum from "@/views/Kurikulum.vue";

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
