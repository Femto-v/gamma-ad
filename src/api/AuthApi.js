import BaseApi from "./BaseApi";

export default class AuthApi extends BaseApi {
    async login(username, password) {
        return this.get({
            entity: "authentication",
            login: username,
            password: password,
        });
    }
}
