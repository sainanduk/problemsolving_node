const { Sequelize } = require('sequelize');
require('dotenv').config();

// Neon connection string
const connectionString = process.env.DATABASE_URL

console.log('Attempting to connect to Neon database...');

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: console.log, // Enable logging temporarily for debugging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // Required for Neon to avoid certificate errors
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
