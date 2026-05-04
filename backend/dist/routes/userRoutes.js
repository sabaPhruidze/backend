"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controller/userController"));
const userSchema_1 = require("../validation/userSchema");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// PUBLIC AUTH ROUTES
router.post("/login", (0, validate_1.validate)(userSchema_1.loginSchema, "body", "Validation Errors"), userController_1.default.loginUsers);
router.post("/register", (0, validate_1.validate)(userSchema_1.registerSchema, "body", "Validation Errors"), userController_1.default.registerUsers);
// refresh stays public without access token ,because refresh works with cookies
router.post("/refresh", userController_1.default.refreshAccessToken);
// PROTECTED AUTH ROUTES
// req.user is needed to make refreshTokenHash null
router.post("/logout", authMiddleware_1.protect, userController_1.default.logout);
// ADMIN ONLY ROUTES
router.get("/", authMiddleware_1.protect, //added access token check
(0, roleMiddleware_1.restrictTo)("admin"), //only admin is allowed
(0, validate_1.validate)(userSchema_1.userQuerySchema, "query", "Query Validation Errors"), userController_1.default.getUsers);
router.get("/debug/explain", authMiddleware_1.protect, (0, roleMiddleware_1.restrictTo)("admin"), (0, validate_1.validate)(userSchema_1.userQuerySchema, "query", "Query validation error"), userController_1.default.explainUsersQuery);
// SELF OR ADMIN ROUTES
router.get("/:id", authMiddleware_1.protect, //access token check
(0, validate_1.validate)(userSchema_1.userIdParamSchema, "params", "Params Validation Errors"), roleMiddleware_1.allowSelfOrAdmin, // only check's its acccount
userController_1.default.getUserById);
router.put("/:id", authMiddleware_1.protect, (0, validate_1.validate)(userSchema_1.userIdParamSchema, "params", "Params Validation Errors"), roleMiddleware_1.allowSelfOrAdmin, (0, validate_1.validate)(userSchema_1.updateUserBody, "body", "Update Validation Errors"), userController_1.default.updateUser);
router.delete("/:id", authMiddleware_1.protect, (0, validate_1.validate)(userSchema_1.userIdParamSchema, "params", "Params validation Error"), roleMiddleware_1.allowSelfOrAdmin, userController_1.default.deleteUser);
exports.default = router;
