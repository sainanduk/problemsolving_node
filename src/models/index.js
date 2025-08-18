const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import model definitions
const User = require("./User")(sequelize, DataTypes);
const Question = require("./Question")(sequelize, DataTypes);
const Submission = require("./Submission")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);
const Company = require("./Company")(sequelize, DataTypes);
const Editorial = require("./Questioneditorial")(sequelize, DataTypes);
const Testcase = require("./Testcases")(sequelize, DataTypes);
const UserQuestion = require("./UserQuestion")(sequelize, DataTypes);

// -------------------- Associations -------------------- //

// 📌 User ↔ Question (through UserQuestion)
User.belongsToMany(Question, { through: UserQuestion, foreignKey: "user_id" });
Question.belongsToMany(User, { through: UserQuestion, foreignKey: "question_id" });

// 📌 User ↔ Submission (1:N)
User.hasMany(Submission, { foreignKey: "user_id" });
Submission.belongsTo(User, { foreignKey: "user_id" });

// 📌 Question ↔ Submission (1:N)
Question.hasMany(Submission, { foreignKey: "question_id" });
Submission.belongsTo(Question, { foreignKey: "question_id" });

// 📌 Question ↔ Tag (M:N)
Question.belongsToMany(Tag, { through: "question_tags", foreignKey: "question_id" });
Tag.belongsToMany(Question, { through: "question_tags", foreignKey: "tag_id" });

// 📌 Question ↔ Company (M:N)
Question.belongsToMany(Company, { through: "question_companies", foreignKey: "question_id" });
Company.belongsToMany(Question, { through: "question_companies", foreignKey: "company_id" });

// 📌 Question ↔ Editorial (1:1)
Question.hasOne(Editorial, { foreignKey: "question_id" });
Editorial.belongsTo(Question, { foreignKey: "question_id" });

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
  Submission,
  Tag,
  Company,
  Editorial,
  Testcase,
  UserQuestion,
  sequelize,
  Sequelize,
};

module.exports = models;
