const { log } = require("console");

// controllers/QuestionController.js
class QuestionController {
  constructor({ Question, QuestionBody, Testcase, Editorial, Tag, Company, UserQuestion }) {
    this.Question = Question;
    this.QuestionBody = QuestionBody;
    this.Testcase = Testcase;
    this.Editorial = Editorial;
    this.Tag = Tag;
    this.Company = Company;
    this.UserQuestion = UserQuestion;
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
      console.log("Request body:", req.body.slug);
      
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
      console.log(" Question created:", question);
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

  // Get all questions with pagination and search
  async getAllQuestions(req, res) {
    try {
      const userId = req.user?.userId;
      console.log('User ID:', userId);
      
      // DEBUG: Check if any questions exist at all
      const totalCount = await this.Question.count();
      console.log(`Total questions in database: ${totalCount}`);
      
      if (totalCount === 0) {
        return res.status(200).json({
          success: true,
          message: "No questions found in database",
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPreviousPage: false,
            nextPage: null,
            previousPage: null
          }
        });
      }
      
      // Extract query parameters
      const {
        page = 1,
        limit = 10,
        search,
        id,
        title,
        slug,
        difficulty,
        premium_only,
        is_active // Remove default value here
      } = req.query;
      
      console.log('Query params:', { 
        page, limit, search, id, title, slug, 
        difficulty, premium_only, is_active 
      });
  
      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
  
      // Build where conditions
      const whereConditions = {};
      
      // Only filter by is_active if explicitly provided
      if (is_active !== undefined && is_active !== '') {
        whereConditions.is_active = is_active === 'true' || is_active === true;
        console.log('Added is_active filter:', whereConditions.is_active);
      }
  
      // Search by specific fields
      if (id) {
        whereConditions.id = id;
      }
      
      if (title) {
        whereConditions.title = {
          [this.Question.sequelize.Sequelize.Op.iLike]: `%${title}%`
        };
      }
      
      if (slug) {
        whereConditions.slug = {
          [this.Question.sequelize.Sequelize.Op.iLike]: `%${slug}%`
        };
      }
  
      if (difficulty) {
        whereConditions.difficulty = difficulty.toUpperCase();
      }
  
      if (premium_only !== undefined && premium_only !== '') {
        whereConditions.premium_only = premium_only === 'true' || premium_only === true;
      }
  
      // General search across id, title, and slug
      if (search) {
        const searchConditions = [];
        
        // If search is a number, search by ID
        if (!isNaN(search)) {
          searchConditions.push({ id: parseInt(search) });
        }
        
        // Search in title and slug
        searchConditions.push(
          {
            title: {
              [this.Question.sequelize.Sequelize.Op.iLike]: `%${search}%`
            }
          },
          {
            slug: {
              [this.Question.sequelize.Sequelize.Op.iLike]: `%${search}%`
            }
          }
        );
  
        whereConditions[this.Question.sequelize.Sequelize.Op.or] = searchConditions;
      }
  
      console.log('Final where conditions:', JSON.stringify(whereConditions, null, 2));
  
      // Base query options
      const queryOptions = {
        where: whereConditions,
        limit: limitNum,
        offset: offset,
        order: [['id', 'ASC']],
        distinct: true
      };
  
      // Add user status include if authenticated
      if (userId) {
        queryOptions.include = [
          {
            model: this.UserQuestion,
            where: { user_id: userId },
            required: false, // LEFT JOIN - include questions even if no user status exists
            attributes: ['status', 'last_solved_at']
          }
        ];
        console.log('Added UserQuestion include for user:', userId);
      }
  
      console.log('Final query options:', JSON.stringify(queryOptions, null, 2));
  
      // Execute query with count for pagination
      const { count, rows: questions } = await this.Question.findAndCountAll(queryOptions);
  
      console.log(`Found ${count} total questions, ${questions.length} in current page`);
  
      // If no results with filters, try without UserQuestion include
      if (questions.length === 0 && userId && queryOptions.include) {
        console.log('No results with include, trying without UserQuestion include...');
        
        const simpleQueryOptions = {
          where: whereConditions,
          limit: limitNum,
          offset: offset,
          order: [['id', 'ASC']]
        };
        
        const { count: simpleCount, rows: simpleQuestions } = await this.Question.findAndCountAll(simpleQueryOptions);
        console.log(`Simple query found ${simpleCount} total questions, ${simpleQuestions.length} in current page`);
        
        if (simpleQuestions.length > 0) {
          // Format without user status
          const formattedQuestions = simpleQuestions.map(question => ({
            ...question.toJSON(),
            userStatus: 'not_attempted',
            lastSolvedAt: null
          }));
  
          return res.status(200).json({
            success: true,
            data: formattedQuestions,
            pagination: {
              currentPage: pageNum,
              totalPages: Math.ceil(simpleCount / limitNum),
              totalItems: simpleCount,
              itemsPerPage: limitNum,
              hasNextPage: pageNum < Math.ceil(simpleCount / limitNum),
              hasPreviousPage: pageNum > 1,
              nextPage: pageNum < Math.ceil(simpleCount / limitNum) ? pageNum + 1 : null,
              previousPage: pageNum > 1 ? pageNum - 1 : null
            }
          });
        }
      }
  
      // Format the response
      const formattedQuestions = questions.map(question => {
        const questionData = question.toJSON();
        
        if (userId) {
          const userStatus = questionData.UserQuestions?.[0];
          return {
            ...questionData,
            userStatus: userStatus?.status || 'not_attempted',
            lastSolvedAt: userStatus?.last_solved_at || null,
            UserQuestions: undefined // Remove the raw join data
          };
        } else {
          return {
            ...questionData,
            userStatus: 'not_attempted',
            lastSolvedAt: null
          };
        }
      });
  
      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPreviousPage = pageNum > 1;
  
      res.status(200).json({
        success: true,
        data: formattedQuestions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPreviousPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          previousPage: hasPreviousPage ? pageNum - 1 : null
        }
      });
  
    } catch (error) {
      console.error('Error in getAllQuestions:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  // Get question by id (with body, testcases, editorial, tags, companies)
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId; // Optional user ID from auth middleware
      
      console.log("Getting question by ID:", id, "User ID:", userId);
      
      const includeModels = [
        {
          model: this.QuestionBody,
          attributes: ['description_md', 'constraints_md', 'hints_md']
        },
        {
          model: this.Testcase,
          attributes: ['id', 'input', 'output', 'is_public']
        },
        {
          model: this.Tag,
          through: { attributes: [] }, // Exclude junction table attributes
          attributes: ['id', 'name', 'slug']
        },
        {
          model: this.Company,
          through: { attributes: [] }, // Exclude junction table attributes
          attributes: ['id', 'name', 'slug']
        }
      ];
      
      // Add UserQuestion include if user is authenticated
      if (userId) {
        includeModels.push({
          model: this.UserQuestion,
          where: { user_id: userId },
          required: false, // LEFT JOIN - include question even if no user status exists
          attributes: ['status', 'last_solved_at']
        });
      }
      
      const question = await this.Question.findByPk(id, {
        include: includeModels,
        attributes: ['id', 'slug', 'title', 'difficulty', 'premium_only', 'is_active', 'acceptance_rate', 'likes_count', 'dislikes_count']
      });
      
      if (!question)
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });
      
      console.log("Question found:", question.title);
      
      // Format the response according to the specified structure
      const questionData = question.toJSON();
      
      // Get user status if available
      const userStatus = userId && questionData.UserQuestions?.[0];
      
      // Format test cases
      const test_cases = questionData.TestCases ? questionData.TestCases.map(tc => ({
        id: tc.id.toString(),
        input: tc.input,
        expected_output: tc.output,
        is_public: tc.is_public
      })) : [];
      
      // Format tags
      const tags = questionData.Tags ? questionData.Tags.map(tag => ({
        id: tag.id.toString(),
        name: tag.name,
        slug: tag.slug
      })) : [];
      
      // Format companies
      const companies = questionData.Companies ? questionData.Companies.map(company => ({
        id: company.id.toString(),
        name: company.name,
        slug: company.slug
      })) : [];
      
      // Build the formatted response
      const formattedQuestion = {
        id: questionData.id.toString(),
        slug: questionData.slug,
        title: questionData.title,
        difficulty: questionData.difficulty,
        premium_only: questionData.premium_only,
        is_active: questionData.is_active,
        acceptance_rate: questionData.acceptance_rate ? questionData.acceptance_rate.toString() : "0.00",
        likes_count: questionData.likes_count ? questionData.likes_count.toString() : "0",
        dislikes_count: questionData.dislikes_count ? questionData.dislikes_count.toString() : "0",
        description_md: questionData.QuestionBody?.description_md || "",
        constraints_md: questionData.QuestionBody?.constraints_md || "",
        hints_md: questionData.QuestionBody?.hints_md || "",
        test_cases: test_cases,
        tags: tags,
        companies: companies,
        user_status: userStatus?.status || "not_attempted",
        last_solved_at: userStatus?.last_solved_at || null
      };
      
      console.log("Formatted question response prepared");
      
      res.status(200).json({ 
        success: true, 
        data: formattedQuestion 
      });
    } catch (error) {
      console.error("Error in getQuestionById:", error);
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

    // Prepare testcases with question_id (snake_case for database)
    const formattedTestcases = testcases.map(tc => ({
      question_id: questionId,
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
        question_id: questionId,
        content_md: content,
        video_url: videoLink,
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
