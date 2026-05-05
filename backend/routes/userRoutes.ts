import { Router } from "express";

import userController from "../controller/userController";
import { authRateLimiter } from "../middleware/rateLimitMiddleware";

import {
  loginSchema,
  registerSchema,
  userIdParamSchema,
  userQuerySchema,
  updateUserBody,
} from "../validation/userSchema";

import { protect } from "../middleware/authMiddleware";
import { restrictTo, allowSelfOrAdmin } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validate";

const router = Router();
// PUBLIC AUTH ROUTES

router.post(
  "/login",
  authRateLimiter, //brute force protection
  validate(loginSchema, "body", "Validation Errors"),
  userController.loginUsers,
);
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema, "body", "Validation Errors"),
  userController.registerUsers,
);
// refresh stays public without access token ,because refresh works with cookies
router.post("/refresh", userController.refreshAccessToken);

// PROTECTED AUTH ROUTES

// req.user is needed to make refreshTokenHash null
router.post("/logout", protect, userController.logout);

// ADMIN ONLY ROUTES

router.get(
  "/",
  protect, //added access token check
  restrictTo("admin"), //only admin is allowed
  validate(userQuerySchema, "query", "Query Validation Errors"),
  userController.getUsers,
);

router.get(
  "/debug/explain",
  protect,
  restrictTo("admin"),
  validate(userQuerySchema, "query", "Query validation error"),
  userController.explainUsersQuery,
);

// SELF OR ADMIN ROUTES
router.get(
  "/:id",
  protect, //access token check
  validate(userIdParamSchema, "params", "Params Validation Errors"),
  allowSelfOrAdmin, // only check's its acccount
  userController.getUserById,
);

router.put(
  "/:id",
  protect,
  validate(userIdParamSchema, "params", "Params Validation Errors"),
  allowSelfOrAdmin,
  validate(updateUserBody, "body", "Update Validation Errors"),
  userController.updateUser,
);
router.delete(
  "/:id",
  protect,
  validate(userIdParamSchema, "params", "Params validation Error"),
  allowSelfOrAdmin,
  userController.deleteUser,
);

export default router;
