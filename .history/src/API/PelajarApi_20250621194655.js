import BaseApi from "./BaseApi";

export default class PelajarApi extends BaseApi {
    constructor(sessionId) {
        super();
        this.sessionId = sessionId;
    }

    async getPelajar(sesi, semester, limit = 3, offset = 0, filters = {}) {
        const params = {
            entity: "pelajar",
            session_id: this.sessionId,
            sesi,
            semester,
            limit,
            offset,
            ...filters,
        };
        return await this.get(params);
    }
}
