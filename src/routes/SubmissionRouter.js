const express = require("express");
const router = express.Router();
const { Submission, Testcase, UserQuestion } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const SubmissionsController = new (require("../controllers/SubmissionController"))(
  Submission,
  Testcase,
  UserQuestion
);

// All routes now explicitly start with /submissions
router.post("/submissions/:id", authenticateToken, (req, res) => SubmissionsController.createSubmission(req, res));
router.get("/submissions/user", authenticateToken, (req, res) => SubmissionsController.getUserSubmissions(req, res));
router.get("/submissions/:id", authenticateToken, (req, res) => SubmissionsController.getSubmissionById(req, res));
router.get("/submissions/question/:questionId", authenticateToken, (req, res) => SubmissionsController.getSubmissionsByQuestion(req, res));

module.exports = router;
