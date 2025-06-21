<script setup>
import { ref } from "vue";
import AuthApi from "@/api/AuthApi";

const login = ref("");
const password = ref("");
const sessionId = ref("");
const isLoading = ref(false);

const authApi = new AuthApi();

const setCookie = (name, value, hours) => {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
};

const handleLogin = async () => {
    try {
        isLoading.value = true;
        const data = await authApi.login(login.value, password.value);

        if (data?.[0]?.session_id) {
            alert("Login successful!");
            // Store in both localStorage and cookie for compatibility
            localStorage.setItem(
                "web.fc.utm.my_usersession",
                JSON.stringify(data[0])
            );
            sessionId.value = data[0].session_id;
            setCookie("session_id", sessionId.value, 1); // 1 hour expiry
            window.location.replace("/main");
        } else {
            alert("Invalid login response!");
            console.log("Response:", data);
        }
    } catch (error) {
        alert("Invalid credentials or failed to fetch!");
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};
</script>

<!-- Keep your existing template/style -->
