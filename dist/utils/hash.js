"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 10;
async function hashPassword(password) {
    return await bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
async function comparePasswords(password, hashed) {
    return await bcryptjs_1.default.compare(password, hashed);
}
