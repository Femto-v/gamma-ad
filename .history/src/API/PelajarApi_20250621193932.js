import BaseApi from "./BaseApi";

export default class PelajarApi extends BaseApi {
    constructor(sessionId) {
        super();
        this.sessionId = sessionId;
    }

    async getPelajar(sesi, semester, limit = 10, offset = 0) {
        return await this.get({
            entity: "pelajar",
            session_id: this.sessionId,
            sesi,
            semester,
            limit,
            offset,
        });
    }
}
