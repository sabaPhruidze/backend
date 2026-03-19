"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//short time token 15minutes
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId, type: "access" }, // payload type addedd
    process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};
exports.generateAccessToken = generateAccessToken;
// long time token 7d
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
