const sequelize = require('../config/database');

async function initDatabase(options = {}) {
  await sequelize.sync(options);
}

async function closeDatabase() {
  await sequelize.close();
}

async function checkDatabaseConnection() {
  await sequelize.authenticate();
}

module.exports = { initDatabase, closeDatabase, checkDatabaseConnection, sequelize };
