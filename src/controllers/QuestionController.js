// controllers/QuestionController.js
class QuestionController {
  constructor({ Question, QuestionBody, Testcase, Editorial, Tag, Company }) {
    this.Question = Question;
    this.QuestionBody = QuestionBody;
    this.Testcase = Testcase;
    this.Editorial = Editorial;
    this.Tag = Tag;
    this.Company = Company;
  }

  // Create question
  async createQuestion(req, res) {
    const t = await this.Question.sequelize.transaction();
    try {
      const {
        slug,
        title,
        difficulty,
        premium_only,
        is_active,
        acceptance_rate,
        description_md,
        constraints_md,
        hints_md,
      } = req.body;

      // Create main Question
      const question = await this.Question.create(
        {
          slug,
          title,
          difficulty,
          premium_only,
          is_active,
          acceptance_rate,
        },
        { transaction: t }
      );

      // Create QuestionBody
      await this.QuestionBody.create(
        {
          question_id: question.id,
          description_md,
          constraints_md,
          hints_md,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(201).json({ success: true, data: question });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update question
  async updateQuestion(req, res) {
    const t = await this.Question.sequelize.transaction();
    try {
      const { id } = req.params;
      const {
        slug,
        title,
        difficulty,
        premium_only,
        is_active,
        acceptance_rate,
        description_md,
        constraints_md,
        hints_md,
      } = req.body;

      const question = await this.Question.findByPk(id);
      if (!question)
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });

      // Update Question
      await question.update(
        { slug, title, difficulty, premium_only, is_active, acceptance_rate },
        { transaction: t }
      );

      // Update QuestionBody (if exists, else create)
      const qb = await this.QuestionBody.findByPk(id);
      if (qb) {
        await qb.update(
          { description_md, constraints_md, hints_md },
          { transaction: t }
        );
      } else {
        await this.QuestionBody.create(
          { question_id: id, description_md, constraints_md, hints_md },
          { transaction: t }
        );
      }

      await t.commit();
      res.status(200).json({ success: true, message: "Question updated" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get all questions
  async getAllQuestions(req, res) {
    try {
      const questions = await this.Question.findAll();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get question by id (with body, testcases, editorial, tags, companies)
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await this.Question.findByPk(id, {
        include: [
          this.QuestionBody,
          this.Testcase,
          this.Editorial,
          this.Tag,
          this.Company,
        ],
      });
      if (!question)
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });
      res.status(200).json({ success: true, data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete question
  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.Question.destroy({ where: { id } });
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });
      res.status(200).json({ success: true, message: "Question deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Add testcase
async addTestcase(req, res) {
  try {
    const { questionId, testcases } = req.body; 

    const question = await this.Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Prepare testcases with questionId
    const formattedTestcases = testcases.map(tc => ({
      questionId,
      input: tc.input,
      output: tc.output
    }));

    // Bulk insert
    const createdTestcases = await this.Testcase.bulkCreate(formattedTestcases);

    res.status(201).json({ success: true, data: createdTestcases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


  // Add editorial
  async addEditorial(req, res) {
    try {
      const { questionId, content, videoLink } = req.body;
      const editorial = await this.Editorial.create({
        questionId,
        content,
        videoLink,
      });
      res.status(201).json({ success: true, data: editorial });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Assign tag to question
  async addTag(req, res) {
    try {
      const { questionId, tagId } = req.body;
      const question = await this.Question.findByPk(questionId);
      const tag = await this.Tag.findByPk(tagId);
      if (!question || !tag)
        return res
          .status(404)
          .json({ success: false, message: "Invalid IDs" });
      await question.addTag(tag);
      res
        .status(200)
        .json({ success: true, message: "Tag assigned to question" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Assign company to question
  async addCompany(req, res) {
    try {
      const { questionId, companyId } = req.body;
      const question = await this.Question.findByPk(questionId);
      const company = await this.Company.findByPk(companyId);
      if (!question || !company)
        return res
          .status(404)
          .json({ success: false, message: "Invalid IDs" });
      await question.addCompany(company);
      res
        .status(200)
        .json({ success: true, message: "Company assigned to question" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = QuestionController;
