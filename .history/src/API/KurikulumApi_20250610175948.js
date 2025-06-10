import BaseApi from "./BaseApi";

export default class KurikulumApi extends BaseApi {
    async getCurricula() {
        return this.get({ entity: "kurikulum" });
    }
    async getCohort(cohort) {
        return this.get({ entity: "kurikulum", cohort });
    }
    async getSubjects(id_kurikulum) {
        return this.get({ entity: "kurikulum_subjek", id_kurikulum });
    }
    async getElectiveDetails(id_kurikulum_subjek) {
        return this.get({
            entity: "kurikulum_subjek_elektif",
            id_kurikulum_subjek,
        });
    }
}
