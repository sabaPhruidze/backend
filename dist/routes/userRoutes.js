"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controller/userController"));
const userSchema_1 = require("../validation/userSchema");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get("/", (0, validate_1.validate)(userSchema_1.userQuerySchema, "query", "Query Validation Errors"), userController_1.default.getUsers);
router.get("/:id", (0, validate_1.validate)(userSchema_1.userIdParamSchema, "params", "Params Validation Errors"), authMiddleware_1.protect, userController_1.default.getUserById);
router.post("/login", (0, validate_1.validate)(userSchema_1.loginSchema, "body", "Validation Errors"), userController_1.default.loginUsers);
router.post("/register", (0, validate_1.validate)(userSchema_1.registerSchema, "body", "Validation Errors"), userController_1.default.registerUsers);
router.put("/:id", authMiddleware_1.protect, userController_1.default.updateUser);
router.delete("/:id", authMiddleware_1.protect, userController_1.default.deleteUser);
exports.default = router;
