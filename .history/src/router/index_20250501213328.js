import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Main from "@/views/Main.vue";

const routes = [
    { path: "/", name: "Home", component: Home },
    { path: "/login", name: "Login", component: Login },
    { path: "/main", name: "Main", component: Main },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
