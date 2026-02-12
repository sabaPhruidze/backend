const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");
router.get("/", userController.getUsers);
router.post("/login", protect, userController.loginUsers);
router.post("/register", userController.registerUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
