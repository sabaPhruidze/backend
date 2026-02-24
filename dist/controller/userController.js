"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModels_1 = __importDefault(require("../models/userModels"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
console.log(process.cwd());
const getUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 5, } = req.query;
        const filter = {}; //this type shuts the filter.$or and filter.role issue
        //in filter we add conditions what type of user we want
        if (search) {
            filter.$or = [
                // $or means search document where first or second option is true
                { name: { $regex: search, $options: "i" } }, //$regex means search according to search
                { email: { $regex: search, $options: "i" } }, //$options means in "i" case not to make case insensitive AaBb
            ];
        }
        if (role) {
            filter.role = role;
        } // 1. skip = (1-1)*5 so on first page will be 5 , than 2. skip = (2-1)*5 it will leave first five and will write on next page 6-10...
        const skip = (page - 1) * limit; // pagination means slice like pages
        const [items, total] = await Promise.all([
            // all together waits of finish both
            userModels_1.default.find(filter).skip(skip).limit(limit).select("-password"), // if - was not written than it will show only id and password but if added eveything will be shwon besides it
            userModels_1.default.countDocuments(filter),
        ]);
        const pages = Math.ceil(total / limit);
        return res.status(200).json({
            items,
            page,
            limit,
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
        const userExists = await userModels_1.default.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }
        //const salt = await bcrypt.genSalt(10);
        //const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await userModels_1.default.create({ name, email, password: hashedPassword });
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message });
    }
};
const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModels_1.default.findOne({ email }).select("+password"); // password will come but typescript might still think undefined so I will write down that case
        if (!user || !user.password) {
            return res
                .status(400)
                .json({ message: "Email or Password is not correct" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Email or Password is not correct" });
        }
        return res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message: message });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModels_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
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
const generateToken = (id) => {
    const secret = process.env.JTW_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing");
    }
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: "30d",
    });
};
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModels_1.default.findById(id).select("-password");
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
exports.default = {
    getUsers,
    registerUsers,
    loginUsers,
    updateUser,
    deleteUser,
    getUserById,
};
