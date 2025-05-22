import BaseApi from "./BaseApi";

export default class TimetableApi extends BaseApi {
    async getTimetableInfo(no_matric) {
        return this.get({
            entity: "pelajar_subjek",
            no_matric: no_matric,
        });
    }
}
