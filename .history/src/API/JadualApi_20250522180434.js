import BaseApi from "./BaseApi";

export default class Timetable extends BaseApi {
    async getJadualInfo() {
        return this.get({
            entity: "pelajar_subjek",
            no_matrik: no_matrik,
            sesi: sesi,
            semester: semester,
        });
    }
}
