<script setup>
import { ref, onMounted, computed } from "vue";
import Toggle from "@/components/Toggle.vue";
import ProfileBanner from "@/components/ProfileBanner.vue";
import SemesterApi from "@/api/SemesterApi";
import SubjekApi from "@/api/SubjekApi";
import { userInfo, userName, userMatric } from "@/constants/ApiConstants.js";

// Set user info
const lsData = JSON.parse(localStorage.getItem("web.fc.utm.my_usersession"));
if (lsData) {
  userName.value = lsData.full_name;
  userMatric.value = lsData.login_name;
}

const selectedKurikulum = ref("Semua");
const selectedSubject = ref("Semua");

const subjectRows = ref([]);
const error = ref(null);

const semesterApi = new SemesterApi();
const subjekApi = new SubjekApi();

const currentSession = ref("");
const currentSemester = ref("");

const itemsPerPage = 10;
const currentPage = ref(1);

// Fetch and process data
onMounted(async () => {
  try {
    const sessionData = await semesterApi.getCurrentSemesterInfo();
    if (sessionData.length > 0) {
      currentSession.value = sessionData[0].sesi;
      currentSemester.value = sessionData[0].semester;

      const subjectData = await subjekApi.getSubjectSections(currentSession.value, currentSemester.value);

      // Expect subjectData to be array of subjects, each with seksyen_list
      if (Array.isArray(subjectData)) {
        subjectRows.value = subjectData.flatMap(subj =>
          (Array.isArray(subj.seksyen_list) ? subj.seksyen_list : []).map(section => ({
            code: subj.kod_subjek,
            name: subj.nama_subjek,
            shortCode: subj.kod_fakulti ?? "-",
            kredit: subj.kredit ?? 0,
            seksyen: section.seksyen,
            drPensyarah: section.pensyarah,
            bilPelajar: section.bil_pelajar,
            bilSeksyen: subj.bil_seksyen ?? (subj.seksyen_list?.length ?? 0),
            bilPensyarah: subj.bil_pensyarah ?? new Set((subj.seksyen_list ?? []).map(s => s.pensyarah)).size,
          }))
        );
      } else {
        subjectRows.value = [];
      }
    }
  } catch (err) {
    error.value = "Gagal mendapatkan data subjek.";
    console.error("[ERROR] Failed to fetch subject data:", err);
  }
});

// Pagination
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return subjectRows.value.slice(start, start + itemsPerPage);
});

const pageCount = computed(() => {
  return Math.ceil(subjectRows.value.length / itemsPerPage) || 1;
});

function gotoPage(page) {
  if (page < 1) page = 1;
  if (page > pageCount.value) page = pageCount.value;
  currentPage.value = page;
}
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <Toggle />

    <main>
      <!-- Banner -->
      <ProfileBanner titleBanner="Subjek" />

      <!-- Filters (keep simple for now) -->
      <div class="flex flex-wrap items-center gap-3 px-4 py-2">
        <div>
          Kurikulum:
          <select v-model="selectedKurikulum" class="ml-1 px-2 py-1 border rounded">
            <option value="Semua">Semua</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          Kod/Nama Subjek:
          <select v-model="selectedSubject" class="ml-1 px-2 py-1 border rounded">
            <option value="Semua">Semua</option>
            <!-- You can auto-fill options if you want -->
          </select>
        </div>
        <!-- You may add a search box here if needed -->
      </div>

      <!-- Card Section -->
      <div class="flex flex-col gap-4 px-4 py-2">
        <div
          v-for="(subject, index) in paginatedRows"
          :key="(currentPage-1)*itemsPerPage+index"
          class="bg-blue-100 rounded-xl shadow p-4 relative transition"
        >
          <!-- Top Right Action Button -->
          <button
            class="absolute top-3 right-3 rounded bg-gray-200 hover:bg-gray-300 p-2"
            title="Maklumat Jadual"
          >
            <!-- Simple document icon SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2"/>
              <path d="M9 7h6M9 11h6M9 15h3" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- Main Subject Info -->
          <div class="font-semibold text-lg">{{ subject.code }}</div>
          <div class="text-xl font-normal mb-1">{{ subject.name }}</div>
          <div class="flex justify-between text-gray-700 mb-2 text-sm">
            <div>{{ subject.shortCode }}</div>
            <div>kredit: {{ subject.kredit }}</div>
          </div>
          <div class="flex gap-4 text-gray-700 text-[15px]">
            <div>Bil. Seksyen: {{ subject.seksyen ?? '-' }}</div>
            <div>Bil. Pensyarah: {{ subject.drPensyarah ?? '-' }}</div>
            <div>Bil. Pelajar: {{ subject.bilPelajar ?? '-' }}</div>
          </div>
        </div>
        <div v-if="!paginatedRows.length && !error" class="text-center text-gray-500 py-8">
          Tiada data subjek untuk dipaparkan.
        </div>
        <div v-if="error" class="text-red-600 text-center py-2">
          {{ error }}
        </div>
      </div>

      <!-- Pagination Dropdown -->
      <div class="text-sm flex justify-center py-4 items-center gap-2">
        <button @click="gotoPage(1)" :disabled="currentPage === 1">&lt;&lt;</button>
        <button @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1">&lt;</button>
          <span>
            Page
            <select
              v-model="currentPage"
              @change="gotoPage(Number(currentPage))"
              class="mx-1 px-2 py-1 border rounded"
            >
              <option v-for="page in pageCount" :key="page" :value="page">
                {{ page }}
              </option>
            </select>
            of {{ pageCount }}
          </span>
        <button @click="gotoPage(currentPage + 1)" :disabled="currentPage === pageCount">&gt;</button>
        <button @click="gotoPage(pageCount)" :disabled="currentPage === pageCount">&gt;&gt;</button>
      </div>
    </main>

    <!-- Footer -->
    <p class="text-xs text-center px-4 pb-6">
      Jika anda mempunyai sebarang komen atau pertanyaan mengenai halaman web ini sila hubungi
      webmaster di <a href="mailto:ttms@fc.utm.my" class="text-blue-600">ttms@fc.utm.my</a><br />
      Hakcipta Terpelihara © 2002-2025, Fakulti Komputeran, UTM
    </p>
  </div>
</template>
