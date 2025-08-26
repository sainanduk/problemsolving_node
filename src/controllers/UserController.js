// controllers/UserController.js
const { Op, fn, col, literal } = require("sequelize");
const {
  User,
  UserQuestion,
  Question,
  Tag,
  Company,
  QuestionTags,
  QuestionCompanies,
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
      const id = req.user.userId;
      console.log("User ID:", id);

      // Get total questions count by difficulty
      const totalQuestionsByDifficulty = await Question.findAll({
        attributes: [
          'difficulty',
          [fn('COUNT', col('id')), 'count']
        ],
        where: { is_active: true },
        group: ['difficulty'],
        raw: true
      });

      console.log("Total questions by difficulty:", totalQuestionsByDifficulty);

      // Initialize totals
      const total = {
        easy: 0,
        medium: 0,
        hard: 0
      };

      // Map the results to our format
      totalQuestionsByDifficulty.forEach(item => {
        const difficulty = item.difficulty.toLowerCase();
        total[difficulty] = parseInt(item.count);
      });

      console.log("Processed total:", total);

      // Get user's question progress
      const userQuestions = await UserQuestion.findAll({
        where: { user_id: id },
        include: [{ 
          model: Question, 
          attributes: ["id", "difficulty"],
          where: { is_active: true }
        }],
      });
      
      console.log("User questions found:", userQuestions.length);

      // Initialize solved structure
      const solved = {
        easy: {
          solved: 0,
          partial: 0,
          unsolved: total.easy
        },
        medium: {
          solved: 0,
          partial: 0,
          unsolved: total.medium
        },
        hard: {
          solved: 0,
          partial: 0,
          unsolved: total.hard
        }
      };

      // Process user questions
      userQuestions.forEach(uq => {
        if (uq.Question && uq.Question.difficulty) {
          const difficulty = uq.Question.difficulty.toLowerCase();
          
          if (uq.status === 'solved') {
            solved[difficulty].solved += 1;
            solved[difficulty].unsolved -= 1;
          } else if (uq.status === 'attempted') {
            solved[difficulty].partial += 1;
            solved[difficulty].unsolved -= 1;
          }
        }
      });

      console.log("Processed solved:", solved);

      // Calculate overall statistics
      const total_questions = total.easy + total.medium + total.hard;
      const total_solved = solved.easy.solved + solved.medium.solved + solved.hard.solved;
      const total_partial = solved.easy.partial + solved.medium.partial + solved.hard.partial;
      const completion_percentage = total_questions > 0 ? parseFloat(((total_solved / total_questions) * 100).toFixed(1)) : 0;

      const overall = {
        total_questions,
        total_solved,
        total_partial,
        completion_percentage
      };

      console.log("Overall stats:", overall);

      // Get solved question IDs for tags and companies
      const solvedQuestionIds = userQuestions
        .filter((uq) => uq.status === "solved")
        .map((uq) => uq.Question.id);

      console.log("Solved question IDs:", solvedQuestionIds);

      let tags = [];
      let companies = [];

      // Get tags and companies for solved questions
      if (solvedQuestionIds.length > 0) {
        try {
          // Get tags for solved questions using the many-to-many relationship
          const questionsWithTags = await Question.findAll({
            where: {
              id: {
                [Op.in]: solvedQuestionIds
              }
            },
            include: [{
              model: Tag,
              through: { attributes: [] }, // Exclude junction table attributes
              attributes: ['id', 'name']
            }],
            attributes: ['id']
          });

          console.log("Questions with tags found:", questionsWithTags.length);

          // Count tags across all solved questions
          const tagMap = new Map();
          questionsWithTags.forEach(question => {
            question.Tags.forEach(tag => {
              const tagId = tag.id.toString();
              const tagName = tag.name;
              
              if (tagMap.has(tagId)) {
                tagMap.set(tagId, {
                  ...tagMap.get(tagId),
                  solved: tagMap.get(tagId).solved + 1
                });
              } else {
                tagMap.set(tagId, {
                  id: tagId,
                  name: tagName,
                  solved: 1
                });
              }
            });
          });

          tags = Array.from(tagMap.values());
          console.log("Processed tags:", tags);

        } catch (tagError) {
          console.error("Error fetching tags:", tagError);
          tags = [];
        }

        try {
          // Get companies for solved questions using the many-to-many relationship
          const questionsWithCompanies = await Question.findAll({
            where: {
              id: {
                [Op.in]: solvedQuestionIds
              }
            },
            include: [{
              model: Company,
              through: { attributes: [] }, // Exclude junction table attributes
              attributes: ['id', 'name']
            }],
            attributes: ['id']
          });

          console.log("Questions with companies found:", questionsWithCompanies.length);

          // Count companies across all solved questions
          const companyMap = new Map();
          questionsWithCompanies.forEach(question => {
            question.Companies.forEach(company => {
              const companyId = company.id.toString();
              const companyName = company.name;
              
              if (companyMap.has(companyId)) {
                companyMap.set(companyId, {
                  ...companyMap.get(companyId),
                  solved: companyMap.get(companyId).solved + 1
                });
              } else {
                companyMap.set(companyId, {
                  id: companyId,
                  name: companyName,
                  solved: 1
                });
              }
            });
          });

          companies = Array.from(companyMap.values());
          console.log("Processed companies:", companies);

        } catch (companyError) {
          console.error("Error fetching companies:", companyError);
          companies = [];
        }
      }

      // Return the response in the requested format
      res.json({
        total,
        solved,
        overall,
        tags: tags.sort((a, b) => b.solved - a.solved),
        companies: companies.sort((a, b) => b.solved - a.solved),
      });
      
    } catch (err) {
      console.error("Dashboard error:", err);
      console.error("Error stack:", err.stack);
      res.status(500).json({ 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
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


