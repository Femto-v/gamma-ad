import BaseApi from "@/api/BaseApi";

export default class SemesterApi extends BaseApi {
    async getCurrentSemesterInfo() {
        return this.get({ entity: "sesisemester" });
    }
}
