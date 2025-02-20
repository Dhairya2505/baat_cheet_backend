"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class APIError {
    constructor(statusCode, message, data = []) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}
exports.default = APIError;
