const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserQuestion = sequelize.define(
    "UserQuestion",
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "users", // must match your Users table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      question_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        references: {
          model: "questions", // must match your Questions table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("solved", "attempted", "not_attempted"),
        defaultValue: "not_attempted",
      },
      last_solved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "user_questions",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "question_id"],
        },
      ],
    }
  );

  return UserQuestion;
};
