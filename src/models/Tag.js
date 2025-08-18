// models/tag.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tag = sequelize.define(
    "Tag",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(96),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "tags",
      timestamps: true, // createdAt, updatedAt
      indexes: [{ unique: true, fields: ["slug"] }],
    }
  );

  return Tag;
};
