const { Op } = require("sequelize");
class TagsController {
  constructor({ Tag, Question, QuestionTags }) {
    this.Tag = Tag;
    this.Question = Question;
    this.QuestionTags = QuestionTags;
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

  // Get all tags with pagination
  async getAllTags(req, res) {
    try {
      // Parse query parameters with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      console.log("Pagination params:", { page, limit, offset });

      // Get tags with pagination
      const { count, rows: tags } = await this.Tag.findAndCountAll({
        attributes: ['id', 'name', 'slug'],
        limit: limit,
        offset: offset,
        order: [['name', 'ASC']] // Order by name alphabetically
      });

      console.log("Tags found:", tags.length, "Total count:", count);

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limit);
      const pagination = {
        currentPage: page,
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: limit
      };

      // Format tags to match the expected response structure
      const formattedTags = tags.map(tag => ({
        id: tag.id.toString(),
        name: tag.name,
        slug: tag.slug
      }));

      console.log("Pagination metadata:", pagination);

      // Return response in the specified format
      res.json({
        tags: formattedTags,
        pagination: pagination
      });

    } catch (error) {
      console.error("Error in getAllTags:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  async searchTags(req, res) {

    try {
      const { query } = req.query;  
      if (!query) return res.status(400).json({ error: "Query parameter is required" });
      const tags = await this.Tag.findAll({
        where: {
          name: {
            [Op.iLike]: `%${query}%`
          }
        },
        include: [
          {
            model: this.Question,
            through: { attributes: [] }, // exclude join table data
            attributes: ["id", "title", "difficulty"],
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
      const { name,slug } = req.body;

      const tag = await this.Tag.findByPk(id);
      if (!tag) return res.status(404).json({ error: "Tag not found" });

      tag.name = name || tag.name;
      tag.slug = slug || tag.slug;
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
      console.log(tag, question);
      

      if (!tag || !question) {
        return res.status(404).json({ error: "Tag or Question not found" });
      }

      await this.QuestionTags.create({ tag_id: tagId, question_id: questionId });

      return res.json({ message: "Tag assigned to question" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TagsController;

