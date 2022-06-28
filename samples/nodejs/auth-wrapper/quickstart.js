"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_wrapper_1 = require("@cognite/auth-wrapper");
const sdk_1 = require("@cognite/sdk");
class MyProjectTest {
    constructor() {
        this.client = new sdk_1.CogniteClient({
            appId: 'testing-app',
            project: process.env.COGNITE_OIDC_PROJECT,
            baseUrl: process.env.COGNITE_BASE_URL,
            authentication: {
                provider: auth_wrapper_1.CogniteAuthWrapper,
                credentials: {
                    method: 'client_credentials',
                    authority: process.env.COGNITE_AUTHORITY,
                    client_id: process.env.COGNITE_CLIENT_ID,
                    client_secret: process.env.COGNITE_CLIENT_SECRET,
                    grant_type: process.env.COGNITE_GRANT_TYPE,
                    scope: process.env.COGNITE_SCOPE,
                },
            },
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield this.client.assets.list());
        });
    }
}
exports.default = new MyProjectTest().run();
