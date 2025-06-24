import BaseApi from "./BaseApi";

export default class SubjekPelajarApi extends BaseApi {
    // Fetch students for a given subject/section
    async getSubjekPelajar({
        session_id,
        sesi,
        semester,
        kod_subjek,
        seksyen,
    }) {
        // Params: entity=subjek_pelajar&session_id=...&sesi=...&semester=...&kod_subjek=...&seksyen=...
        return await this.get({
            entity: "subjek_pelajar",
            session_id,
            sesi,
            semester,
            kod_subjek,
            seksyen,
        });
    }
}
