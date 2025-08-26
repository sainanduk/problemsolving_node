// models/question.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Question = sequelize.define(
    "Question",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(127),
        allowNull: false,
        unique: true, // SEO-friendly unique slug (like "two-sum")
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
        allowNull: false,
      },
      premium_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      acceptance_rate: {
        type: DataTypes.DECIMAL(5, 2), // e.g. 45.67%
        allowNull: true,
        validate: {
          min: 0,
          max: 100,
        },
      },
      likes_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      dislikes_count: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
    },
    {
      tableName: "questions",
      timestamps: true, // createdAt & updatedAt
      indexes: [
        { unique: true, fields: ["slug"] },
        { fields: ["difficulty"] },
        { fields: ["premium_only"] },
        { fields: ["is_active"] },
      ],
    }
  );

  return Question;
};
