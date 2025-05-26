<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

// Load user info from session
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Dummy subject data
const subjectList = ref([
    {
        code: "MCSD1013",
        name: "Business Intelligence and Analytics",
        section: "1",
        lecturer: "NOR ERNE NAZIRA BINTI BAZIN",
        course: "FSKSM",
        students: 42,
        faculty: "FSKSM / -",
    },
    {
        code: "MCSD1043",
        name: "Research Design and Analysis Data Science",
        section: "1",
        lecturer: "MOHD SHAHAIZAN BIN OTHMAN",
        course: "FSKSM",
        students: 35,
        faculty: "FSKSM / -",
    },
    {
        code: "MCSD1113",
        name: "Statistic for Data Science",
        section: "1",
        lecturer: "MOHAMAD SHUKOR BIN TALIB",
        course: "FSKSM",
        students: 40,
        faculty: "FSKSM / -",
    },
    // Add more as needed
]);

// Store selected subject codes
const selectedSubjects = ref([]);

const toggleSelect = (code) => {
    if (selectedSubjects.value.includes(code)) {
        selectedSubjects.value = selectedSubjects.value.filter(
            (c) => c !== code
        );
    } else {
        selectedSubjects.value.push(code);
    }
};

const submitAnalysis = () => {
    console.log("Selected Subjects:", selectedSubjects.value);
    alert("Analisis dihantar untuk: " + selectedSubjects.value.join(", "));
};
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <!-- Main Content -->
        <main>
            <!-- Header -->
            <div
                class="bg-cover bg-center h-60 text-white flex flex-col justify-center items-center"
                style="background-image: url('/backdropMain.jpg')"
            >
                <img src="/UTM-LOGO.png" class="w-16 mb-2" alt="UTM Logo" />
                <h2 class="text-2xl font-bold drop-shadow-md">
                    Analisis Subjek
                </h2>
                <p class="drop-shadow-md">{{ userInfo }}</p>
            </div>

            <!-- Table Section -->
            <div class="overflow-x-auto px-4 py-4">
                <table
                    class="w-full border border-black text-sm text-center bg-[#d0e7f7]"
                >
                    <thead class="bg-[#b8d4ea]">
                        <tr>
                            <th class="border border-black px-2 py-1">Bil</th>
                            <th class="border border-black px-2 py-1">
                                Kod Subjek
                            </th>
                            <th class="border border-black px-2 py-1">
                                Nama Subjek
                            </th>
                            <th class="border border-black px-2 py-1">
                                Seksyen
                            </th>
                            <th class="border border-black px-2 py-1">
                                Pensyarah
                            </th>
                            <th class="border border-black px-2 py-1">
                                Kursus
                            </th>
                            <th class="border border-black px-2 py-1">
                                Bil. Pelajar
                            </th>
                            <th class="border border-black px-2 py-1">
                                Fakulti (Pelajar)
                            </th>
                            <th class="border border-black px-2 py-1">
                                Pilih Item
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(subject, index) in subjectList"
                            :key="index"
                        >
                            <td class="border border-black px-2 py-1">
                                {{ index + 1 }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.code }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.name }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.section }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.lecturer }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.course }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.students }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                {{ subject.faculty }}
                            </td>
                            <td class="border border-black px-2 py-1">
                                <input
                                    type="checkbox"
                                    :value="subject.code"
                                    :checked="
                                        selectedSubjects.includes(subject.code)
                                    "
                                    @change="toggleSelect(subject.code)"
                                />
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

            <!-- Submit Button -->
            <div class="text-center mb-8">
                <button
                    @click="submitAnalysis"
                    class="bg-blue-800 text-white text-lg font-bold py-2 px-8 rounded-lg hover:bg-blue-900"
                >
                    Hantar
                </button>
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
