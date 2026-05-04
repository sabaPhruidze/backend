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
        const queryData = req.validated?.query;
        if (!queryData)
            return res.status(400).json({ message: "Query data is missing" });
        const { search, role } = queryData;
        // useQuerySchema turn's it into number so page will be already number not string
        const pageNum = queryData.page ?? 1;
        const limitNum = queryData.limit ?? 5; //same here
        const filter = {};
        if (search?.trim()) {
            const term = search.trim();
            filter.$or = [
                { name: { $regex: term, $options: "i" } },
                { email: { $regex: term, $options: "i" } },
            ];
        }
        // role is laready checked user or admin
        if (role) {
            filter.role = role;
        }
        const skip = (pageNum - 1) * limitNum;
        const [items, total] = await Promise.all([
            userModels_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            userModels_1.default.countDocuments(filter),
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
        const registerData = req.validated?.body;
        if (!registerData)
            return res.status(400).json({ message: "Register data is missing" });
        const { name, email, password } = registerData;
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
        return res.status(500).json({ message });
    }
};
const loginUsers = async (req, res) => {
    try {
        const loginData = req.validated?.body;
        if (!loginData)
            return res
                .status(400)
                .json({ status: "fail", message: "login data is missing" });
        const { email, password } = loginData;
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
        // real refresh token now will be hashed for db
        const hashedRefreshToken = (0, token_util_1.hashToken)(refreshToken);
        // in user document we only save hashed
        user.refreshTokenHash = hashedRefreshToken;
        //  in order to for real written in db this save is necessary
        await user.save();
        const cookieSameSite = process.env.COOKIE_SAMESITE ??
            "lax";
        //browser refresh cookie-ს მხოლოდ ამ route-ზე გაგზავნის.
        res.cookie("refresh", refreshToken, {
            httpOnly: true, // cookie can not be read by JS (For XSS)
            secure: process.env.NODE_ENV === "production", //only send on https when run on web, now I still have in development so I will use http
            sameSite: cookieSameSite, //CSRF issue solution
            path: "/api/users/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000, //will live 7 days
        });
        return res.status(200).json({
            status: "success",
            accessToken,
        });
    }
    catch (error) {
        console.error("loginUsers error:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // instead of req.body we will use already checked and validated body
        const updateData = req.validated?.body;
        if (updateData)
            return res.status(400).json({ message: "Update data is mising" });
        // now only name and email will be sent in database
        const user = await userModels_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -refreshTokenHash"); //response sensitive fields closed
        if (!user)
            return res.status(404).json({ message: "User does not exist" });
        return res.status(200).json(user);
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
        const queryData = req.validated?.query;
        if (!queryData)
            return res.status(400).json({ message: "Query data is missing" });
        // Added this in order to see if the mongodb really use indexes or not
        const { search, role } = queryData;
        const filter = {};
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
        const explanation = await userModels_1.default.find(filter).explain("executionStats");
        return res.status(200).json({
            filter,
            explanation,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message });
    }
};
const refreshAccessToken = async (req, res) => {
    try {
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
        const cookieSameSite = process.env.COOKIE_SAMESITE ??
            "lax";
        //checking refresh token with it's secret signature
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        if (decoded.type !== "refresh") {
            return res.status(401).json({
                status: "fail",
                message: "Invalid token type",
            });
        }
        // brought user's relevant refreshTokenHash
        const user = await userModels_1.default.findById(decoded.id).select("+refreshTokenHash -password"); // in standard we have not selected refreshTokenHash so I wrote + as for password , it might forget that it does not have to bring so I added in case
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "User not found",
            });
        }
        if (!user.refreshTokenHash) {
            return res.status(401).json({
                status: "fail",
                message: "Refresh token is not active",
            });
        }
        // real refresh token is hashed here (from cookie)
        const incomingRefreshTokenHash = (0, token_util_1.hashToken)(refreshToken);
        // here we will check refreshTokenHash with refreshToken
        // if hash does not mach this token must not be considered safe
        if (incomingRefreshTokenHash !== user.refreshTokenHash) {
            user.refreshTokenHash = null; //refresh session canceled
            await user.save();
            res.clearCookie("refresh", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: cookieSameSite,
                path: "/api/users/refresh",
            });
            return res.status(401).json({
                status: "fail",
                message: "Refresh token reuse detected. Please log in again",
            });
        }
        // this time done no rotation yes so I will add access token return
        const newAccessToken = (0, token_util_1.generateAccessToken)(user._id.toString());
        // this time will ad refresh token as well
        const newRefreshToken = (0, token_util_1.generateRefreshToken)(user._id.toString());
        const newHashedRefreshToken = (0, token_util_1.hashToken)(newRefreshToken); // new refresh token hash
        user.refreshTokenHash = newHashedRefreshToken; // on db old hash changed by new
        await user.save(); // new hash is saved in real in db
        res.cookie("refresh", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: cookieSameSite,
            path: "/api/users/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
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
// logout endpoint
const logout = async (req, res) => {
    try {
        const cookieSameSite = process.env.COOKIE_SAMESITE ??
            "lax";
        // from procect middleware we know which user logs out
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                status: "fail",
                message: "Not authorized",
            });
        }
        // by this on logout saved db refresh token hash will become null
        await userModels_1.default.findByIdAndUpdate(userId, {
            $set: { refreshTokenHash: null },
        });
        // refresh cookie will be deleted from brower
        res.clearCookie("refresh", {
            httpOnly: true, //same cookie type
            secure: process.env.NODE_ENV === "production",
            sameSite: cookieSameSite,
            path: "/api/users/refresh",
        });
        return res.status(200).json({
            status: "success",
            message: "Logged out succesfully",
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            status: "error",
            message,
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
    logout,
};
