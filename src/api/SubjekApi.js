// src/api/SubjekApi.js
import BaseApi from "./BaseApi";

export default class SubjekApi extends BaseApi {
  async getSubjectSections(sesi, semester) {
    return await this.get({
      entity: "subjek_seksyen",
      sesi,
      semester,
    });
  }
}
