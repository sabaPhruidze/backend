import { Router } from "express";

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
  validate(userQuerySchema, "query", "Query Validation Errors"),
  userController.getUsers,
);
router.get(
  "/:id",
  validate(userIdParamSchema, "params", "Params Validation Errors"),
  protect,
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
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

export default router;
