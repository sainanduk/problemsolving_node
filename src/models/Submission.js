// models/submissions.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Submission = sequelize.define(
    "Submission",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users", // table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      question_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "questions", // table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      language: {
        type: DataTypes.STRING(50), // ex: "cpp", "python", "java"
        allowNull: false,
      },
      code: {
        type: DataTypes.TEXT("long"), // store the user’s solution
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "wrong_answer",
          "time_limit_exceeded",
          "runtime_error",
          "compilation_error"
        ),
        defaultValue: "pending",
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      execution_time: {
        type: DataTypes.FLOAT, // in seconds
        allowNull: true,
      },
      memory_used: {
        type: DataTypes.INTEGER, // in KB
        allowNull: true,
      },
    },
    {
      tableName: "submissions",
      timestamps: true,
      indexes: [
        { fields: ["user_id"] },
        { fields: ["question_id"] },
        { fields: ["status"] },
      ],
    }
  );

  return Submission;
};
