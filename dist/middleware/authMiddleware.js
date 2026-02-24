"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../models/userModels"));
const protect = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "There is not token" });
    } //token must start with Bearer
    try {
        const token = auth.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "JWT_SECRET is missing" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await userModels_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "not authorized" });
        }
        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        return res.status(401).json({ message: "not authorized" });
    }
};
exports.protect = protect;
