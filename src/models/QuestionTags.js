// models/question_tags.js
module.exports = (sequelize, DataTypes) => {
  const QuestionTags = sequelize.define(
    "QuestionTags",
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
      tag_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
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
      timestamps: true, // The table has createdAt and updatedAt
      indexes: [
        {
          unique: true,
          fields: ["question_id", "tag_id"], // prevent duplicate tag mapping
        },
      ],
    }
  );

  return QuestionTags;
};
