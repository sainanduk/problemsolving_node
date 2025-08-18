// models/company.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Must be a valid URL",
          },
        },
      },
    },
    {
      tableName: "companies",
      timestamps: true,
      indexes: [{ unique: true, fields: ["slug"] }],
    }
  );

  return Company;
};
