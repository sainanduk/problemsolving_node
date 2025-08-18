// models/questionBody.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const QuestionBody = sequelize.define(
    "QuestionBody",
    {
      question_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        references: {
          model: "questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      description_md: {
        type: DataTypes.TEXT, // full problem statement in Markdown
        allowNull: false,
      },
      constraints_md: {
        type: DataTypes.TEXT, // input/output constraints
        allowNull: true,
      },
      hints_md: {
        type: DataTypes.TEXT, // list of hints in Markdown
        allowNull: true,
      },
    },
    {
      tableName: "question_bodies",
      timestamps: true,
    }
  );

  return QuestionBody;
};
