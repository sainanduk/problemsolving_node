const express = require("express");
const router = express.Router();
const { Company, Question, QuestionCompanies } = require("../models"); 
const CompaniesController = require("../controllers/CompaniesController");

const companiesController = new CompaniesController(Company, Question, QuestionCompanies);

// CRUD routes
router.post("/companies", (req, res) => companiesController.createCompany(req, res));
router.get("/companies", (req, res) => companiesController.getAllCompanies(req, res));
router.get("/companies/:id", (req, res) => companiesController.getCompanyById(req, res));
router.put("/companies/:id", (req, res) => companiesController.updateCompany(req, res));
router.delete("/companies/:id", (req, res) => companiesController.deleteCompany(req, res));

// Mapping route
router.post("/companies/assign", (req, res) => companiesController.addCompanyToQuestion(req, res));

module.exports = router;
