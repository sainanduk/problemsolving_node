// routes/questionRoutes.js
const express = require("express");
const router = express.Router();
const {
  Question,
  QuestionBody,
  Testcase,
  Editorial,
  Tag,
  Company,
} = require("../models");
const QuestionController = require("../controllers/QuestionController");

const questionController = new QuestionController({
  Question,
  QuestionBody,
  Testcase,
  Editorial,
  Tag,
  Company,
});

// CRUD routes
router.post("/questions", (req, res) =>
  questionController.createQuestion(req, res)
);
router.get("/questions", (req, res) =>
  questionController.getAllQuestions(req, res)
);
router.get("/questions/:id", (req, res) =>
  questionController.getQuestionById(req, res)
);
router.put("/questions/:id", (req, res) =>
  questionController.updateQuestion(req, res)
);
router.delete("/questions/:id", (req, res) =>
  questionController.deleteQuestion(req, res)
);

// Add testcase, editorial, tags, companies
router.post("/questions/testcases", (req, res) =>
  questionController.addTestcase(req, res)
);
router.post("/questions/editorials", (req, res) =>
  questionController.addEditorial(req, res)
);
router.post("/questions/tags", (req, res) =>
  questionController.addTag(req, res)
);
router.post("/questions/companies", (req, res) =>
  questionController.addCompany(req, res)
);

module.exports = router;

