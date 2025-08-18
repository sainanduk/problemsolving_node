const { Op } = require("sequelize");
class TagsController {
  constructor({ Tag, Question, QuestionTag }) {
    this.Tag = Tag;
    this.Question = Question;
    this.QuestionTag = QuestionTag;
  }

  // Create a new tag
  async createTag(req, res) {
    try {
      const { name,slug } = req.body;

      if (!name) return res.status(400).json({ error: "Tag name is required" });

      const existing = await this.Tag.findOne({ where: { name } });
      if (existing) return res.status(400).json({ error: "Tag already exists" });

      const tag = await this.Tag.create({ name, slug });
      return res.status(201).json(tag);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get all tags with question count
  async getAllTags(req, res) {
    try {
      const tags = await this.Tag.findAll({
        include: [
          {
            model: this.Question,
            through: { attributes: [] }, // exclude join table data
            attributes: ["id", "title"],
          },
        ],
      });

      const result = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        questionCount: tag.Questions.length,
        questions: tag.Questions,
      }));

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get single tag with questions
  async getTagById(req, res) {
    try {
      const { id } = req.params;

      const tag = await this.Tag.findByPk(id, {
        include: [
          {
            model: this.Question,
            through: { attributes: [] },
            attributes: ["id", "title", "difficulty"],
          },
        ],
      });

      if (!tag) return res.status(404).json({ error: "Tag not found" });

      return res.json(tag);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update tag
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const tag = await this.Tag.findByPk(id);
      if (!tag) return res.status(404).json({ error: "Tag not found" });

      tag.name = name || tag.name;
      await tag.save();

      return res.json(tag);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete tag
  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      const tag = await this.Tag.findByPk(id);
      if (!tag) return res.status(404).json({ error: "Tag not found" });

      await tag.destroy();
      return res.json({ message: "Tag deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Assign tag to a question
  async addTagToQuestion(req, res) {
    try {
      const { tagId, questionId } = req.body;

      const tag = await this.Tag.findByPk(tagId);
      const question = await this.Question.findByPk(questionId);

      if (!tag || !question) {
        return res.status(404).json({ error: "Tag or Question not found" });
      }

      await this.QuestionTag.create({ tag_id: tagId, question_id: questionId });

      return res.json({ message: "Tag assigned to question" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TagsController;

