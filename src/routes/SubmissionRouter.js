const express = require("express");
const router = express.Router();
const { Submission, TestCase } = require("../models");
const authMiddleware = require("../middleware/auth");

const SubmissionsController = new (require("../controllers/SubmissionsController"))(
  Submission,
  TestCase
);

// All routes now explicitly start with /submissions
router.post("/submissions", authMiddleware, (req, res) => SubmissionsController.createSubmission(req, res));
router.get("/submissions/user", authMiddleware, (req, res) => SubmissionsController.getUserSubmissions(req, res));
router.get("/submissions/:id", authMiddleware, (req, res) => SubmissionsController.getSubmissionById(req, res));
router.get("/submissions/question/:questionId", authMiddleware, (req, res) => SubmissionsController.getSubmissionsByQuestion(req, res));

module.exports = router;
