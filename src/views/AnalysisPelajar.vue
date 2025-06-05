<script setup>
import { ref, onMounted } from "vue";
import SemesterApi from "@/api/SemesterApi";
import Toggle from "@/components/Toggle.vue";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";
import ProfileBanner from "@/components/ProfileBanner.vue";
import Footer from "@/components/Footer.vue";

// Session data
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
    userName.value = lsData.full_name;
    userMatric.value = lsData.login_name;
}

// Sample subject data
const subjectList = ref([
    {
        code: "SCSE1013",
        name: "Business Intelligence and Analytics",
        section: "1",
        lecturer: "NOR ERNE NAZIRA BINTI BAZIN",
        students: 23,
    },
    {
        code: "SCSE1013",
        name: "Research Design and Analysis Data Science",
        section: "1",
        lecturer: "MOHD SHAHAIZAN BIN OTHMAN",
        students: 30,
    },
    {
        code: "SCSE1203",
        name: "Statistic for Data Science",
        section: "1",
        lecturer: "MOHAMAD SHUKOR BIN TALIB",
        students: 0,
    },
    {
        code: "SCSE1203",
        name: "Big Data Management",
        section: "1",
        lecturer: "NOR AZIZAH BT. ALI",
        students: 34,
    },
    {
        code: "SCSE1203",
        name: "Big Data Management",
        section: "1",
        lecturer: "NOORFA HASZLINNA BT. MUSTAFFA",
        students: 25,
    },
    {
        code: "SCSE1224",
        name: "Advanced Analytics for Data Science",
        section: "1",
        lecturer: "NOR HAIZAN BT. MOHAMED RADZI",
        students: 0,
    },
    // Add more if needed
]);

// Handle click
const showStudentDetails = (subject) => {
    alert(
        `Show details for ${subject.code} - ${subject.name}\nBil. Pelajar: ${subject.students}`
    );
};
</script>

<template>
    <div class="bg-gray-100 min-h-screen">
        <Toggle />

        <!-- Main Content -->
        <main>
            <!-- Header -->
            <ProfileBanner titleBanner="Student Analysis" />

            <!-- Table -->
            <div class="overflow-x-auto px-4 py-4">
                <table
                    class="w-full border border-black text-sm text-center bg-[#d0e7f7]"
                >
                    <thead class="bg-[#b8d4ea]">
                        <tr>
                            <th class="border border-black px-2 py-1">Bil</th>
                            <th class="border border-black px-2 py-1">
                                Subject Code
                            </th>
                            <th class="border border-black px-2 py-1">
                                Subject Name
                            </th>
                            <th class="border border-black px-2 py-1">
                                Section
                            </th>
                            <th class="border border-black px-2 py-1">
                                Lecturer
                            </th>
                            <th class="border border-black px-2 py-1">
                                Num. of Student
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
                                <a
                                    href="#"
                                    @click.prevent="showStudentDetails(subject)"
                                    class="text-blue-600 underline hover:text-blue-800"
                                >
                                    {{ subject.students }}
                                </a>
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
        <Footer />
    </div>
</template>
