const express = require("express");
const router = express.router();
const userController = require("../controller/userController");

router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.createUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
