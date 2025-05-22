import BaseApi from "./BaseApi";

export default class TimetableApi extends BaseApi {
    async getTimetableInfo() {
        return this.get({
            entity: "pelajar_subjek",
        });
    }
}
