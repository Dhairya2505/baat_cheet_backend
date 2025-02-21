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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const APIError_js_1 = __importDefault(require("./../utils/APIError.js"));
const MONGO_DB_js_1 = __importDefault(require("./../database/MONGO_DB.js"));
const UserDuplicacy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const username = (_a = req.body) === null || _a === void 0 ? void 0 : _a.username;
        const email = (_b = req.body) === null || _b === void 0 ? void 0 : _b.email;
        if (!username) {
            res.json(new APIError_js_1.default(400, "Username required"));
            return;
        }
        if (!email) {
            res.json(new APIError_js_1.default(400, "Email required"));
            return;
        }
        const user = yield MONGO_DB_js_1.default.User.findOne({
            userName: username
        });
        const user1 = yield MONGO_DB_js_1.default.User.findOne({
            email: email
        });
        const user2 = yield MONGO_DB_js_1.default.User.findOne({
            userName: username,
            email: email
        });
        if (user2) {
            res.json(new APIError_js_1.default(409, "User exists"));
            return;
        }
        else if (user) {
            res.json(new APIError_js_1.default(409, "Username taken"));
            return;
        }
        else if (user1) {
            res.json(new APIError_js_1.default(409, "Email taken"));
            return;
        }
        else {
            next();
        }
    }
    catch (error) {
        res.json(new APIError_js_1.default(500, "Internal server error"));
        return;
    }
});
exports.default = UserDuplicacy;
