"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../models/userModels"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_util_1 = require("../utils/token-util");
console.log(process.cwd());
// .select() , .lean() , sort(), limit/skip ; total count
const getUsers = async (req, res) => {
    try {
        const { search, role, page, limit } = req.query;
        // from query page and limit comes as string so I will convert them to number
        const pageNum = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1); //it will be number or NAN and if NaN it will write ||1 | 10 means counting system, it is like standard | "1" means that if it is number bt -5 or less than 1 math.max writes the number that is above others
        const limitNum = Math.min(Math.max(parseInt(req.query.limit ?? "5", 10) || 5, 1), 100);
        const filter = {};
        //Search name or email
        if (search?.trim()) {
            const term = search.trim();
            filter.$or = [
                { name: { $regex: term, $options: "i" } },
                { email: { $regex: term, $options: "i" } },
            ];
        }
        if (role) {
            filter.role = role;
        }
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            // it will be faster by this way of searching both together
            userModels_1.default.find(filter)
                .sort({ createdAt: -1 }) // last in first shown (using createdat)
                .skip(skip)
                .limit(limitNum) // select(-password) removed because it is already written in model
                .lean(), //fast read
            userModels_1.default.countDocuments(filter), // this is for calculating pages ,how many documents are with the filter
        ]);
        const pages = Math.ceil(total / limitNum);
        return res.status(200).json({
            items,
            page: pageNum,
            limit: limitNum,
            total,
            pages,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: message });
    }
};
const registerUsers = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await userModels_1.default.findOne({ email }).lean(); // I only need to know if this email exist in database or not so I will use lean and it makes faster
        if (userExists) {
            // this is fast and easy check since it is in database we in advance stop
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }
        //const salt = await bcrypt.genSalt(10);
        //const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await userModels_1.default.create({ name, email, password: hashedPassword });
        return res.status(201).json({
            status: "success",
            message: "User registered succesfully",
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000 // wwhen 2 request comes togheter
        ) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message });
    }
};
const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ status: "fail", message: "Email and password is necessary" });
        }
        const user = await userModels_1.default.findOne({ email }).select("+password"); // password will come but typescript might still think undefined so I will write down that case
        const invalidCreds = {
            status: "fail",
            message: "Wrong authentification data",
        };
        if (!user || !user.password) {
            return res.status(401).json(invalidCreds);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json(invalidCreds);
        }
        const userId = user._id.toString(); // mongoose id
        const accessToken = (0, token_util_1.generateAccessToken)(userId);
        const refreshToken = (0, token_util_1.generateRefreshToken)(userId);
        const cookieSameSite = process.env.COOKIE_SAMESITE ??
            "lax";
        //browser refresh cookie-ს მხოლოდ ამ route-ზე გაგზავნის.
        res.cookie("refresh", refreshToken, {
            httpOnly: true, // cookie can not be read by JS (For XSS)
            secure: process.env.NODE_ENV === "production", //only send on https
            sameSite: cookieSameSite, //CSRF issue solution
            path: "/api/users/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000, //will live 7 days
        });
        res.status(200).json({
            status: "success",
            accessToken,
        });
    }
    catch (error) {
        console.error("loginUsers error:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModels_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            return res.status(404).json({ message: "user does not exist" });
        }
        else {
            return res.status(200).json(user);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModels_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "user does not exist" });
        }
        else {
            return res.status(200).json(user);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ message });
    }
};
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModels_1.default.findById(id).lean(); //added lean here as well
        if (!user) {
            return res.status(404).json({ message: "user does not exist" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message });
    }
};
const explainUsersQuery = async (req, res) => {
    try {
        // Added this in order to see if the mongodb really use indexes or not
        const role = req.query.role;
        const filter = {};
        if (role)
            filter.role = role;
        const plan = await userModels_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(10)
            .explain("executionStats");
        return res.status(200).json(plan);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message });
    }
};
const refreshAccessToken = async (req, res) => {
    try {
        console.log("req.cookies =>", req.cookies); // დროებითი შემოწმება
        const refreshToken = req.cookies?.refresh;
        if (!refreshToken) {
            return res.status(401).json({
                status: "fail",
                message: "Refresh token not found",
            });
        }
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            return res.status(500).json({
                status: "error",
                message: "JWT_REFRESH_SECRET is missing",
            });
        }
        //checking refresh token with it's secret signature
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        if (decoded.type !== "refresh") {
            return res.status(401).json({
                status: "fail",
                message: "Invalid token type",
            });
        }
        // chekc if user still exists
        const user = await userModels_1.default.findById(decoded.id).select("-password").lean();
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "User not found",
            });
        }
        // new access token generate
        const newAccessToken = (0, token_util_1.generateAccessToken)(user._id.toString());
        // refresh endpoint only return's access token currently
        return res.status(200).json({
            status: "success",
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log("refreshAccessToken error: ", message);
        return res.status(401).json({
            status: "fail",
            message: "Invalid or expired refresh token",
        });
    }
};
exports.default = {
    getUsers,
    registerUsers,
    loginUsers,
    updateUser,
    deleteUser,
    getUserById,
    explainUsersQuery,
    refreshAccessToken,
};
