const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");


router.post("/", UserController.createUser.bind(UserController));
router.get("/:id", UserController.getUserById.bind(UserController));
router.put("/:id", UserController.updateUser.bind(UserController));
router.delete("/:id", UserController.deleteUser.bind(UserController));
router.get("/:id/dashboard", UserController.getDashboard.bind(UserController));
router.get("/:id/submissions", UserController.getSubmissionActivity.bind(UserController));


module.exports = router;
