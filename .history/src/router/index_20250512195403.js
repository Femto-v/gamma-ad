import { createRouter, createWebHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Main from "@/views/Main.vue";

const routes = [
    { path: "/", redirect: "/login" },
    { path: "/login", name: "Login", component: Login },
    { path: "/main", name: "Main", component: Main },
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
