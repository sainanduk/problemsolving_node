// models/questionEditorial.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const QuestionEditorial = sequelize.define(
    "QuestionEditorial",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      question_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      content_md: {
        type: DataTypes.TEXT, // editorial/solution in Markdown
        allowNull: false,
      },
      video_url: {
        type: DataTypes.STRING(512), // optional video explanation link
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Must be a valid video URL",
          },
        },
      },
      is_official: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // official vs community editorial
      },
    },
    {
      tableName: "question_editorials",
      timestamps: true,
      indexes: [{ fields: ["question_id"] }],
    }
  );

  return QuestionEditorial;
};
