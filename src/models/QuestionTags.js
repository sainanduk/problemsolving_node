// models/question_tags.js
module.exports = (sequelize, DataTypes) => {
  const QuestionTags = sequelize.define(
    "QuestionTags",
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
      tagId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "Tags",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "question_tags",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["questionId", "tagId"], // prevent duplicate tag mapping
        },
      ],
    }
  );

  return QuestionTags;
};
