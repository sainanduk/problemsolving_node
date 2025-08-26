// models/question_companies.js
module.exports = (sequelize, DataTypes) => {
  const QuestionCompanies = sequelize.define(
    "QuestionCompanies",
    {
      question_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      company_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "question_companies",
      timestamps: true, // The table has createdAt and updatedAt
      indexes: [
        {
          unique: true,
          fields: ["question_id", "company_id"], // prevent duplicate company mapping
        },
      ],
    }
  );

  return QuestionCompanies;
};
