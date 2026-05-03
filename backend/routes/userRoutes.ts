import { Router } from "express";
import { restrictTo, allowSelfOrAdmin } from "../middleware/roleMiddleware";
import userController from "../controller/userController";
import {
  loginSchema,
  registerSchema,
  userIdParamSchema,
  userQuerySchema,
} from "../validation/userSchema";

import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

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
  userController.explainUsersQuery,
);
router.get(
  "/:id",
  protect, //access token check
  validate(userIdParamSchema, "params", "Params Validation Errors"),
  allowSelfOrAdmin, // only check's its acccount
  userController.getUserById,
);
router.post(
  "/login",
  validate(loginSchema, "body", "Validation Errors"),
  userController.loginUsers,
);
router.post(
  "/register",
  validate(registerSchema, "body", "Validation Errors"),
  userController.registerUsers,
);
router.post("/logout", protect, userController.logout);
router.post("/refresh", userController.refreshAccessToken);
router.put(
  "/:id",
  protect,
  validate(userIdParamSchema, "params", "Params Validation Errors"),
  allowSelfOrAdmin,
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
