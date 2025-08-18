// controllers/UserController.js
const { Op, fn, col, literal } = require("sequelize");
const {
  User,
  UserQuestion,
  Question,
  Tag,
  Company,
  QuestionTag,
  QuestionCompany,
  Submission,
} = require("../models");

class UserController {
  // Create a new user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const [updated] = await User.update(req.body, {
        where: { id: req.params.id },
      });
      if (!updated) return res.status(404).json({ error: "User not found" });
      const user = await User.findByPk(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const deleted = await User.destroy({ where: { id: req.params.id } });
      if (!deleted) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Dashboard API
  async getDashboard(req, res) {
    try {
      const { id } = req.params; // userId

      // Fetch user stats from user_questions
      const userQuestions = await UserQuestion.findAll({
        where: { user_id: id },
        include: [{ model: Question, attributes: ["id", "difficulty"] }],
      });

      if (!userQuestions.length) {
        return res.json({
          solved: 0,
          attempted: 0,
          not_attempted: 0,
          difficulty: { easy: 0, medium: 0, hard: 0 },
          tags: [],
          companies: [],
        });
      }

      // Status counts
      const solved = userQuestions.filter((uq) => uq.status === "solved").length;
      const attempted = userQuestions.filter((uq) => uq.status === "attempted").length;
      const not_attempted = userQuestions.filter((uq) => uq.status === "not_attempted").length;

      // Difficulty counts (only solved)
      const difficulty = { easy: 0, medium: 0, hard: 0 };
      userQuestions
        .filter((uq) => uq.status === "solved")
        .forEach((uq) => {
          difficulty[uq.Question.difficulty] += 1;
        });

      // Tag-wise solved count
      const tagCounts = await QuestionTag.findAll({
        include: [
          {
            model: Question,
            attributes: ["id"],
            include: [{ model: UserQuestion, where: { user_id: id, status: "solved" } }],
          },
          { model: Tag, attributes: ["id", "name"] },
        ],
      });

      const tags = tagCounts.map((t) => ({
        id: t.Tag.id,
        name: t.Tag.name,
        solved: t.Questions ? t.Questions.length : 0,
      }));

      // Company-wise solved count
      const companyCounts = await QuestionCompany.findAll({
        include: [
          {
            model: Question,
            attributes: ["id"],
            include: [{ model: UserQuestion, where: { user_id: id, status: "solved" } }],
          },
          { model: Company, attributes: ["id", "name"] },
        ],
      });

      const companies = companyCounts.map((c) => ({
        id: c.Company.id,
        name: c.Company.name,
        solved: c.Questions ? c.Questions.length : 0,
      }));

      res.json({
        solved,
        attempted,
        not_attempted,
        difficulty,
        tags,
        companies,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Submissions activity chart (LeetCode-style)
  async getSubmissionActivity(req, res) {
    try {
      const { id } = req.params; // userId

      const submissions = await Submission.findAll({
        attributes: [
          [fn("DATE", col("submitted_at")), "date"],
          [fn("COUNT", col("id")), "count"],
        ],
        where: { user_id: id },
        group: [fn("DATE", col("submitted_at"))],
        order: [[literal("date"), "ASC"]],
      });

      res.json({ submissions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
