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
exports.signin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const APIResponse_1 = __importDefault(require("./../utils/APIResponse"));
const dotenv_2 = __importDefault(require("dotenv"));
const APIError_1 = __importDefault(require("../utils/APIError"));
dotenv_2.default.config();
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.headers.username;
    try {
        const SECRET_KEY = process.env.SECRET_KEY;
        if (SECRET_KEY) {
            const token = yield jsonwebtoken_1.default.sign({
                username: username,
            }, SECRET_KEY);
            res.cookie('BCC', `Bearer ${token}`);
            res.json(new APIResponse_1.default(200, "User signed in"));
            return;
        }
        else {
            res.json(new APIError_1.default(500, "Internal server error"));
            return;
        }
    }
    catch (error) {
        res.json(new APIError_1.default(500, "Internal server error"));
        return;
    }
});
exports.signin = signin;
