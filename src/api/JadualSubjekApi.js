import BaseApi from "./BaseApi";

export default class JadualSubjekApi extends BaseApi {
    /**
     * Fetch timetable slots for a specific subject, section, session, and semester.
     * @param {Object} params
     * @param {string} params.kod_subjek - Subject code
     * @param {string|number} params.seksyen - Section number
     * @param {string} params.sesi - Academic session (e.g. 2024/2025)
     * @param {number|string} params.semester - Semester (1 or 2)
     * @returns {Promise<Array>} Array of schedule slot objects
     */
    async getSubjectSchedule({ kod_subjek, seksyen, sesi, semester }) {
        return this.get({
            entity: "jadual_subjek",
            kod_subjek,
            seksyen,
            sesi,
            semester,
        });
    }
}
