import { ref, computed } from "vue";
// user data
export const userName = ref("noName");
export const userMatric = ref("noMatric");
export const userInfo = computed(
    () => `${userName.value} - ${userMatric.value}`
);
// user semester
const currentSession = ref("-");
const currentSemester = ref("-");
const startDate = ref("-");
const endDate = ref("-");
