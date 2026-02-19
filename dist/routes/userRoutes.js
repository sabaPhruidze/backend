//@ts-check
const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { loginSchema, registerSchema, userIdParamSchema, userQuerySchema, } = require("../validation/userSchema");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const validateQuery = require("../middleware/validateQuery");
const validateParams = require("../middleware/validateParams");
router.get("/", validateQuery(userQuerySchema), userController.getUsers);
router.get("/:id", validateParams(userIdParamSchema), protect, userController.getUserById);
router.post("/login", validate(loginSchema), userController.loginUsers);
router.post("/register", validate(registerSchema), userController.registerUsers);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);
module.exports = router;
