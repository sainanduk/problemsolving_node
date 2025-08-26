// models/user.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
  type: DataTypes.UUID,
  primaryKey: true,
  defaultValue: DataTypes.UUIDV4,
},
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email",
          },
        },
      },
    },
    {
      tableName: "users",
      timestamps: true, // createdAt & updatedAt
      indexes: [
        { unique: true, fields: ["username"] },
        { unique: true, fields: ["email"] },
      ],
    }
  );

  return User;
};
