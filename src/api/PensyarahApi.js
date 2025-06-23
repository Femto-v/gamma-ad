import BaseApi from "./BaseApi.js";

export default class PensyarahApi extends BaseApi {
    constructor(sessionId) {
        super();
        this.sessionId = sessionId;
    }

    /**
     * Get pensyarah (lecturer) list by sesi & semester
     * @param {string} sesi - Academic session, e.g. "2024/2025"
     * @param {number|string} semester - Semester, e.g. 1 or 2
     * @param {object} [extraParams] - Optional: any additional query params
     * @returns {Promise<Array>} List of lecturer objects from API
     */
    async getPensyarah(sesi, semester, extraParams = {}) {
        const params = {
            entity: "pensyarah",
            session_id: this.sessionId,
            sesi: sesi,
            semester: semester,
            ...extraParams,
        };
        return await this.get(params);
    }
}
