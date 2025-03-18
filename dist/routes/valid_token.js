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
exports.valid_token = void 0;
const APIError_1 = __importDefault(require("../utils/APIError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const APIResponse_1 = __importDefault(require("../utils/APIResponse"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const valid_token = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hello");
    const bearer_token = req.cookies['BCC'];
    if (bearer_token) {
        if (bearer_token.split(" ").length == 2) {
            const token = bearer_token.split(" ")[1];
            const SECRET_KEY = process.env.SECRET_KEY;
            if (SECRET_KEY) {
                try {
                    const result = yield jsonwebtoken_1.default.verify(token, SECRET_KEY);
                    if (result) {
                        res.json(new APIResponse_1.default(200, "Authorized", result.username));
                        return;
                    }
                    else {
                        res.json(new APIError_1.default(401, "Unauthorized"));
                        return;
                    }
                }
                catch (error) {
                    res.json(new APIError_1.default(401, "Unauthorized"));
                    return;
                }
            }
            else {
                res.json(new APIError_1.default(500, "Internal server error"));
                return;
            }
        }
        else {
            res.json(new APIError_1.default(401, "Unauthorized"));
            return;
        }
    }
    else {
        res.json(new APIError_1.default(401, "Unauthorized"));
        return;
    }
});
exports.valid_token = valid_token;
