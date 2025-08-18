// models/testcases.js
module.exports = (sequelize, DataTypes) => {
  const TestCase = sequelize.define("TestCase", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
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
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    output: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // true -> shown in problem statement as example
    }
  }, {
    tableName: "testcases",
    timestamps: true,
    underscored: true,
  });

  TestCase.associate = (models) => {
    TestCase.belongsTo(models.Question, {
      foreignKey: "question_id",
      as: "question",
    });
  };

  return TestCase;
};
