// src/api/RuangApi.js
import BaseApi from "./BaseApi";

export default class RuangApi extends BaseApi {
    async getRoomsByFaculty(facultyCode) {
        try {
            const data = await this.get({
                entity: "ruang",
                kod_fakulti: facultyCode,
            });
            return data;
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    }
}
