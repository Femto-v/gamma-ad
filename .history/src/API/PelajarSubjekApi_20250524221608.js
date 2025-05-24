import BaseApi from "./BaseApi";

export default class PelajarSubjekApi extends BaseApi {
    async getTimetableInfo(no_matrik) {
        return this.get({
            entity: "pelajar_subjek",
            no_matrik: no_matrik,
        });
    }
}
