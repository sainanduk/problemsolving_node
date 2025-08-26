const express = require("express");
const router = express.Router();
const { Submission, Testcase, UserQuestion, Question } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const SubmissionsController = new (require("../controllers/SubmissionController"))(
  Submission,
  Testcase,
  UserQuestion,
  Question
);

// All routes now explicitly start with /submissions
router.post("/submissions/:questionId", authenticateToken, (req, res) => SubmissionsController.createSubmission(req, res));
router.get("/submissions", authenticateToken, (req, res) => SubmissionsController.getUserSubmissions(req, res));
router.get("/submissions/:questionId", authenticateToken, (req, res) => SubmissionsController.getSubmissionsByQuestion(req, res));
router.post('/run', authenticateToken, (req, res) => SubmissionsController.runCode(req, res));

module.exports = router;
