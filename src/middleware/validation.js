const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Middleware to validate submission data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSubmission = (req, res, next) => {
  const { problemId, languageId, code } = req.body;
  
  if (!problemId || !languageId || !code) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        problemId: !problemId ? 'Problem ID is required' : null,
        languageId: !languageId ? 'Language ID is required' : null,
        code: !code ? 'Code is required' : null
      }
    });
  }
  
  if (typeof code !== 'string' || code.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid code',
      details: 'Code must be a non-empty string'
    });
  }
  
  if (code.length > 10000) {
    return res.status(400).json({
      error: 'Code too long',
      details: 'Code must be less than 10,000 characters'
    });
  }
  
  next();
};

/**
 * Middleware to validate problem ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateProblemId = (req, res, next) => {
  const problemId = parseInt(req.params.problemId);
  
  if (isNaN(problemId) || problemId <= 0) {
    return res.status(400).json({
      error: 'Invalid problem ID',
      details: 'Problem ID must be a positive integer'
    });
  }
  
  req.params.problemId = problemId;
  next();
};

/**
 * Middleware to validate submission ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSubmissionId = (req, res, next) => {
  const submissionId = parseInt(req.params.submissionId);
  
  if (isNaN(submissionId) || submissionId <= 0) {
    return res.status(400).json({
      error: 'Invalid submission ID',
      details: 'Submission ID must be a positive integer'
    });
  }
  
  req.params.submissionId = submissionId;
  next();
};

/**
 * Middleware to validate user ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateUserId = (req, res, next) => {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({
      error: 'Invalid user ID',
      details: 'User ID must be a positive integer'
    });
  }
  
  req.params.userId = userId;
  next();
};

/**
 * Middleware to validate problem data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateProblem = (req, res, next) => {
  const { title, description, difficulty } = req.body;
  
  if (!title || !description || !difficulty) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        title: !title ? 'Title is required' : null,
        description: !description ? 'Description is required' : null,
        difficulty: !difficulty ? 'Difficulty is required' : null
      }
    });
  }
  
  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid title',
      details: 'Title must be a non-empty string'
    });
  }
  
  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid description',
      details: 'Description must be a non-empty string'
    });
  }
  
  if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
    return res.status(400).json({
      error: 'Invalid difficulty',
      details: 'Difficulty must be EASY, MEDIUM, or HARD'
    });
  }
  
  // Validate optional fields
  if (req.body.time_limit && (isNaN(req.body.time_limit) || req.body.time_limit <= 0)) {
    return res.status(400).json({
      error: 'Invalid time limit',
      details: 'Time limit must be a positive number'
    });
  }
  
  if (req.body.memory_limit && (isNaN(req.body.memory_limit) || req.body.memory_limit <= 0)) {
    return res.status(400).json({
      error: 'Invalid memory limit',
      details: 'Memory limit must be a positive number'
    });
  }
  
  if (req.body.acceptance_rate && (isNaN(req.body.acceptance_rate) || req.body.acceptance_rate < 0 || req.body.acceptance_rate > 100)) {
    return res.status(400).json({
      error: 'Invalid acceptance rate',
      details: 'Acceptance rate must be between 0 and 100'
    });
  }
  
  next();
};

/**
 * Middleware to validate test case data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTestCase = (req, res, next) => {
  const { input_parameters, expected_output } = req.body;
  
  if (!input_parameters || !expected_output) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        input_parameters: !input_parameters ? 'Input parameters are required' : null,
        expected_output: !expected_output ? 'Expected output is required' : null
      }
    });
  }
  
  if (typeof input_parameters !== 'object' || input_parameters === null) {
    return res.status(400).json({
      error: 'Invalid input parameters',
      details: 'Input parameters must be an object'
    });
  }
  
  if (typeof expected_output !== 'object' || expected_output === null) {
    return res.status(400).json({
      error: 'Invalid expected output',
      details: 'Expected output must be an object'
    });
  }
  
  // Validate optional fields
  if (req.body.weight && (isNaN(req.body.weight) || req.body.weight <= 0)) {
    return res.status(400).json({
      error: 'Invalid weight',
      details: 'Weight must be a positive number'
    });
  }
  
  if (req.body.time_limit && (isNaN(req.body.time_limit) || req.body.time_limit <= 0)) {
    return res.status(400).json({
      error: 'Invalid time limit',
      details: 'Time limit must be a positive number'
    });
  }
  
  if (req.body.memory_limit && (isNaN(req.body.memory_limit) || req.body.memory_limit <= 0)) {
    return res.status(400).json({
      error: 'Invalid memory limit',
      details: 'Memory limit must be a positive number'
    });
  }
  
  next();
};

module.exports = {
  validateRequest,
  validateSubmission,
  validateProblemId,
  validateSubmissionId,
  validateUserId,
  validateProblem,
  validateTestCase
};
