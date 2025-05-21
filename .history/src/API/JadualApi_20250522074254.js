import BaseApi from "./BaseApi";

export default class JadualApi extends BaseApi {
    async getJadualInfo(no_matrik, sesi, semester) {
        return this.get({
            entity: "pelajar_subjek",
            no_matrik: no_matrik,
            sesi: sesi,
            semester: semester,
        });
    }
}
