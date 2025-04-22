const express = require("express");
const router = express.Router();
const userController = require("../Controllers/usercontroller");

// Define routes and link them to controller functions
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/createUser", userController.createUser);
router.post("/login",userController.loginUser)

module.exports = router;