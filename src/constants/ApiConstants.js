import { ref, computed } from "vue";
// user data
export const userName = ref("noName");
export const userMatric = ref("noMatric");
export const userInfo = computed(
    () => `${userName.value} - ${userMatric.value}`
);
// user semester
export const currentSession = ref("-");
export const currentSemester = ref("-");
export const startDate = ref("-");
export const endDate = ref("-");
