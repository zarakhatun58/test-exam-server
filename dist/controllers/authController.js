"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = crypto_1.default.createHash("sha256").update(password).digest("hex");
        const user = await User_1.default.create({ username, password: hashedPassword });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = crypto_1.default.createHash("sha256").update(password).digest("hex");
        const user = await User_1.default.findOne({ username, password: hashedPassword });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
