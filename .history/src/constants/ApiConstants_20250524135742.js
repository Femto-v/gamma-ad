import { ref } from "vue";

export const userName = ref("noName");
export const userMatric = ref("noMatric");
export const userInfo = `${userName} - ${userMatric}`;
