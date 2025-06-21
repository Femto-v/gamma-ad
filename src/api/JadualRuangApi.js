import BaseApi from "./BaseApi";

export default class JadualRuangApi extends BaseApi {
    /**
     * Fetch room schedule for a given session, semester, and room code.
     * @param {string} sesi      – Academic session (e.g., "2024/2025").
     * @param {number|string} semester – Semester number (e.g., 2).
     * @param {string} kod_ruang  – Room code (e.g., "N28-01-01").
     * @returns {Promise<Object[]>} List of schedule entries.
     */
    async fetchByRoom(sesi, semester, kod_ruang) {
        return this.get({
            entity: "jadual_ruang",
            sesi,
            semester,
            kod_ruang,
        });
    }

    /**
     * Generic fetch if you need to supply your own params object.
     * @param {Object} params – e.g. { sesi, semester, kod_ruang }
     */
    fetch(params) {
        return this.get({ entity: "jadual_ruang", ...params });
    }
}
