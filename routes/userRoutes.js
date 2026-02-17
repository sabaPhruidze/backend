//@ts-check
const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const { registerSchema } = require("../validation/userSchema");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

router.get("/", userController.getUsers);
router.post("/login", userController.loginUsers);
router.post(
  "/register",
  validate(registerSchema),
  userController.registerUsers,
);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
