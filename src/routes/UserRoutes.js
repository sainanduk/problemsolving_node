const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

router.post("/user", UserController.createUser.bind(UserController));
router.get("/user/:id", UserController.getUserById.bind(UserController));
router.put("/user/:id", UserController.updateUser.bind(UserController));
router.delete("/user/:id", UserController.deleteUser.bind(UserController));
router.get("/user/dashboard/stats", authenticateToken, UserController.getDashboard.bind(UserController));
router.get("/user/:id/submissions", UserController.getSubmissionActivity.bind(UserController));


module.exports = router;
