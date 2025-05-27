<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";

// User info from session
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Dummy data for student clash
const clashList = ref([
    {
        name: "ABDUL RASYID BIN ABD GANI @ GHANI",
        yearCourse: "1SECBH",
        faculty: "FC",
        subjectCount: 6,
        conflicts: [
            "SECJ1023-1:SECJ1113-1 (Fri 10am-11am)",
            "SECJ1023-1:SECJ1113-1 (Fri 11am-12pm)",
        ],
        suggestions: 3,
    },
    {
        name: "ADAM AZHAR BIN NOR ADHA",
        yearCourse: "3SECVH",
        faculty: "FSKSM",
        subjectCount: 6,
        conflicts: [
            "SECV4543-2:SECV3123-1 (Thu 4pm-5pm)",
            "SECV4543-2:SECV3123-1 (Thu 2pm-3pm)",
            "SECV4543-2:SECV3123-1 (Thu 2pm-4pm)",
        ],
        suggestions: 1,
    },
    {
        name: "AFINA SOLEHA BATRISYA BINTI MOHD HISAFUDIN",
        yearCourse: "1SECBH",
        faculty: "FC",
        subjectCount: 6,
        conflicts: [
            "SECJ1113-1:SECJ1023-1 (Fri 10am-11am)",
            "SECJ1113-1:SECJ1023-1 (Fri 11am-12pm)",
        ],
        suggestions: 3,
    },
    {
        name: "ALI MOHAMED FATHY ABDELKADER ELBERMAWY",
        yearCourse: "3SECJH",
        faculty: "FSKSM",
        subjectCount: 7,
        conflicts: [
            "SECJ1033-10:SECJ3032-1 (Mon 8am-9am)",
            "SECJ1033-10:SECJ3032-1 (Mon 9am-10am)",
        ],
        suggestions: 0,
    },
    // More dummy rows as needed...
]);
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <!-- Banner -->
        <main>
            <ProfileBanner titleBanner="Clash Pelajar" />

            <!-- Clash Table -->
            <div class="overflow-x-auto px-4 py-4">
                <table
                    class="w-full border border-black text-sm text-center bg-[#d0e7f7]"
                >
                    <thead class="bg-[#b8d4ea]">
                        <tr>
                            <th class="border border-black px-2 py-1">Bil</th>
                            <th class="border border-black px-2 py-1">Nama</th>
                            <th class="border border-black px-2 py-1">
                                Tahun / Kursus
                            </th>
                            <th class="border border-black px-2 py-1">
                                Fakulti
                            </th>
                            <th class="border border-black px-2 py-1">
                                Bil. Subjek
                            </th>
                            <th class="border border-black px-2 py-1">
                                Pertindihan Jadual
                            </th>
                            <th class="border border-black px-2 py-1">
                                Cadangan
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(student, index) in clashList" :key="index">
                            <td class="border border-black px-2 py-1">
                                {{ index + 1 }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ student.name }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ student.yearCourse }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ student.faculty }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ student.subjectCount }}
                            </td>
                            <td
                                class="border border-black px-2 py-1 text-left px-2 py-1"
                            >
                                <ul class="list-disc list-inside">
                                    <li
                                        v-for="(
                                            conflict, i
                                        ) in student.conflicts"
                                        :key="i"
                                    >
                                        {{ conflict }}
                                    </li>
                                </ul>
                            </td>
                            <td
                                class="border border-black px-2 py-1 font-semibold"
                            >
                                {{ student.suggestions }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="text-sm flex justify-center py-4 space-x-2">
                <button>&lt;&lt;</button>
                <button class="font-bold underline">1</button>
                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>&gt;&gt;</button>
            </div>
        </main>

        <!-- Footer -->
        <p class="text-xs text-center px-4 pb-6">
            Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman
            web ini sila hubungi webmaster di
            <a href="mailto:ttms@fc.utm.my" class="text-blue-600"
                >ttms@fc.utm.my</a
            ><br />
            Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
        </p>
    </div>
</template>
