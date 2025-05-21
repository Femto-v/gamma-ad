import BaseApi from "./BaseApi";

export default class JadualApi extends BaseApi {
    async getJadualInfo() {
        return this.get({
            entity: "jadual",
        });
    }
}
