import BaseApi from "./BaseApi";

export default class Timetable extends BaseApi {
    async getTimetableInfo() {
        return this.get({
            entity: "pelajar_subjek",
        });
    }
}
