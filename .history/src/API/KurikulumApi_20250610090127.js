import BaseApi from "./BaseApi";

export default class KurikulumApi extends BaseApi {
    // Gets all available curricula (returns array: [{ sesi_masuk: ... }, ...])
    async getCurricula() {
        return this.get({ entity: "kurikulum" });
    }
    // Gets curriculum detail for a specific cohort/session
    async getCohort(cohort) {
        return this.get({ entity: "kurikulum", cohort });
    }
}
