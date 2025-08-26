const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model definitions
const User = require("./User")(sequelize, DataTypes);
const Question = require("./Question")(sequelize, DataTypes);
const QuestionBody = require("./QuestionBody")(sequelize, DataTypes);
const Submission = require("./Submission")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);
const Company = require("./Company")(sequelize, DataTypes);
const Editorial = require("./Questioneditorial")(sequelize, DataTypes);
const Testcase = require("./Testcases")(sequelize, DataTypes);
const UserQuestion = require("./UserQuestion")(sequelize, DataTypes);
const QuestionTags = require("./QuestionTags")(sequelize, DataTypes);
const QuestionCompanies = require("./QuestionCompanies")(sequelize, DataTypes);


// -------------------- Associations -------------------- //

// 📌 User ↔ Question (through UserQuestion)
User.belongsToMany(Question, { through: UserQuestion, foreignKey: "user_id" });
Question.belongsToMany(User, { through: UserQuestion, foreignKey: "question_id" });

// question_tags
Question.belongsToMany(Tag, { through: QuestionTags, foreignKey: "question_id" });
Tag.belongsToMany(Question, { through: QuestionTags, foreignKey: "tag_id" });

// question_companies
Question.belongsToMany(Company, { through: QuestionCompanies, foreignKey: "question_id" });
Company.belongsToMany(Question, { through: QuestionCompanies, foreignKey: "company_id" });
// Add these additional associations for junction table access
QuestionTags.belongsTo(Question, { foreignKey: 'question_id' });
QuestionTags.belongsTo(Tag, { foreignKey: 'tag_id' });
Question.hasMany(QuestionTags, { foreignKey: 'question_id' });
Tag.hasMany(QuestionTags, { foreignKey: 'tag_id' });

QuestionCompanies.belongsTo(Question, { foreignKey: 'question_id' });
QuestionCompanies.belongsTo(Company, { foreignKey: 'company_id' });
Question.hasMany(QuestionCompanies, { foreignKey: 'question_id' });
Company.hasMany(QuestionCompanies, { foreignKey: 'company_id' });

// 📌 User ↔ Submission (1:N)
User.hasMany(Submission, { foreignKey: "user_id" });
Submission.belongsTo(User, { foreignKey: "user_id" });

// 📌 Question ↔ Submission (1:N)
Question.hasMany(Submission, { foreignKey: "question_id" });
Submission.belongsTo(Question, { foreignKey: "question_id" });

// 📌 Question ↔ Tag (M:N) - Removed duplicate, using QuestionTags model above

// 📌 Question ↔ Company (M:N) - Removed duplicate, using QuestionCompanies model above

// 📌 Question ↔ Editorial (1:1)
Question.hasOne(Editorial, { foreignKey: "question_id" });
Editorial.belongsTo(Question, { foreignKey: "question_id" });

Question.hasOne(QuestionBody, { foreignKey: "question_id" });
QuestionBody.belongsTo(Question, { foreignKey: "question_id" });

// 📌 Question ↔ Testcase (1:N)
Question.hasMany(Testcase, { foreignKey: "question_id" });
Testcase.belongsTo(Question, { foreignKey: "question_id" });

// 📌 User ↔ UserQuestion (Solved/Attempted status)
User.hasMany(UserQuestion, { foreignKey: "user_id" });
UserQuestion.belongsTo(User, { foreignKey: "user_id" });

Question.hasMany(UserQuestion, { foreignKey: "question_id" });
UserQuestion.belongsTo(Question, { foreignKey: "question_id" });


// -------------------- Export models + sequelize -------------------- //
const models = {
  User,
  Question,
  QuestionBody,
  Submission,
  Tag,
  Company,
  Editorial,
  Testcase,
  UserQuestion,
  sequelize,
  Sequelize,
  QuestionTags,
  QuestionCompanies
};

module.exports = models;
