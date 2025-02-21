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
const APIError_js_1 = __importDefault(require("../utils/APIError.js"));
const MONGO_DB_js_1 = __importDefault(require("./../database/MONGO_DB.js"));
const bcrypt_1 = require("bcrypt");
const CheckUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const username = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.username;
    const password = (_b = req.headers) === null || _b === void 0 ? void 0 : _b.password;
    if (!username) {
        res.json(new APIError_js_1.default(400, "Username required"));
        return;
    }
    if (!password) {
        res.json(new APIError_js_1.default(400, "Password required"));
        return;
    }
    try {
        const user = yield MONGO_DB_js_1.default.User.findOne({
            userName: username
        });
        if (user) {
            const hashedPassword = user.Password;
            if (typeof password == "string" && typeof hashedPassword == "string") {
                if (yield (0, bcrypt_1.compare)(password, hashedPassword)) {
                    next();
                }
                else {
                    res.json(new APIError_js_1.default(401, "Incorrect password"));
                    return;
                }
            }
            else {
                res.json(new APIError_js_1.default(400, "Invalid Password"));
                return;
            }
        }
        else {
            res.json(new APIError_js_1.default(401, "User not found"));
            return;
        }
    }
    catch (error) {
        res.json(new APIError_js_1.default(500, "Internal server error"));
        return;
    }
});
exports.default = CheckUser;
