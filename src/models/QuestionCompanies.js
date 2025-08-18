// models/question_companies.js
module.exports = (sequelize, DataTypes) => {
  const QuestionCompanies = sequelize.define(
    "QuestionCompanies",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      questionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      companyId: {
        type: DataTypes.BIGINT,
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
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["questionId", "companyId"], // prevent duplicate company mapping
        },
      ],
    }
  );

  return QuestionCompanies;
};
