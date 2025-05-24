import { ref, computed } from "vue";

export const userName = ref("noName");
export const userMatric = ref("noMatric");
export const userInfo = computed(
    () => `${userName.value} - ${userMatric.value}`
);
