<script setup>
import { ref, onMounted } from "vue";
import Toggle from "@/components/Toggle.vue";
import SemesterApi from "@/api/SemesterApi";

const userInfo = ref("User Name - Matric No");
// Reactive values for session display
const semesterApi = new SemesterApi();
const currentSession = ref("-");
const currentSemester = ref("-");
const startDate = ref("-");
const endDate = ref("-");

//name and matric values
const userName = ref("");
const noMatric = ref("");
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    noMatric.value = lsData.login_name;
    userInfo.value = `${userName.value} - ${noMatric.value}`;
}

//on mounted
onMounted(async () => {
    const data = await semesterApi.getCurrentSemesterInfo();

    // Optionally pick the latest (first) entry
    if (data && data.length > 0) {
        const latest = data[0];
        currentSession.value = latest.sesi;
        currentSemester.value = latest.semester;
        startDate.value = latest.tarikh_mula;
        endDate.value = latest.tarikh_tamat;
    }
});
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />
        <!-- Main content -->
        <main>
            <div
                class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
                style="background-image: url('/backdropMain.jpg')"
            >
                <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
                <h2 class="text-2xl font-bold drop-shadow-md">Welcome</h2>
                <p class="drop-shadow-md">{{ userInfo }}</p>
            </div>

            <div class="p-4">
                <div class="bg-blue-100 rounded-xl shadow p-4">
                    <div class="grid grid-cols-2 text-sm">
                        <div class="font-bold">Sesi</div>
                        <div>{{ currentSession }}</div>
                        <div class="font-bold">Semester</div>
                        <div>{{ currentSemester }}</div>
                        <div class="font-bold">Tarikh Mula/Tamat</div>
                        <div>{{ startDate }} / {{ endDate }}</div>
                    </div>
                </div>

                <p class="text-xs text-center mt-6">
                    Jika anda mempunyai sebarang komen atau pertanyaan mengenai
                    halaman web ini sila hubungi webmaster di
                    <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                        >ttms@fc.utm.my</a
                    ><br />
                    Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
                </p>
            </div>
        </main>
    </div>
</template>
