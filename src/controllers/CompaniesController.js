class CompaniesController {
  constructor(Company, Question, QuestionCompany) {
    this.Company = Company;
    this.Question = Question;
    this.QuestionCompany = QuestionCompany;
  }

  // Create company
  async createCompany(req, res) {
    try {
      const { name,slug } = req.body;
      if (!name) return res.status(400).json({ error: "Company name is required" });
      if (!slug) return res.status(400).json({ error: "Company slug is required" });
      const existing = await this.Company.findOne({ where: { slug } });
      if (existing) return res.status(400).json({ error: "Company with this slug already exists" });

      const company = await this.Company.create({ name, slug });
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async getCompanyBySlug(req, res) {
    try {
      const { slug } = req.params;
      const company = await this.Company.findOne({
        where: { slug },
        include: [{ model: this.Question, through: { attributes: [] } }]
      });
      if (!company) return res.status(404).json({ error: "Company not found" });
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const companies = await this.Company.findAll();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get single company
  async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await this.Company.findByPk(id, {
        include: [{ model: this.Question, through: { attributes: [] } }]
      });

      if (!company) return res.status(404).json({ error: "Company not found" });
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update company
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const { name,slug } = req.body;

      const company = await this.Company.findByPk(id);
      if (!company) return res.status(404).json({ error: "Company not found" });

      company.name = name || company.name;
      company.slug = slug || company.slug;
      await company.save();

      res.json(company);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete company
  async deleteCompany(req, res) {
    try {
      const { id } = req.params;
      const company = await this.Company.findByPk(id);
      if (!company) return res.status(404).json({ error: "Company not found" });

      await company.destroy();
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Assign company to question
  async addCompanyToQuestion(req, res) {
    try {
      const { companyId, questionId } = req.body;

      const company = await this.Company.findByPk(companyId);
      const question = await this.Question.findByPk(questionId);

      if (!company || !question) {
        return res.status(404).json({ error: "Company or Question not found" });
      }

      await this.QuestionCompany.create({ companyId, questionId });

      res.json({ message: "Company assigned to question successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CompaniesController;
