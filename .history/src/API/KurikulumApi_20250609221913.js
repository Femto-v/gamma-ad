// src/api/KurikulumApi.js
export default class KurikulumApi {
    constructor() {
        this.baseUrl = "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi";
    }
    async getCurricula() {
        // Gets all available curricula
        const response = await fetch(`${this.baseUrl}?entity=kurikulum`);
        if (!response.ok) throw new Error("Failed to fetch");
        return await response.json();
    }
    async getCohort(cohort) {
        // Gets a specific cohort by sesi_masuk (admission session)
        const response = await fetch(
            `${this.baseUrl}?entity=kurikulum&cohort=${encodeURIComponent(
                cohort
            )}`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        return await response.json();
    }
}
