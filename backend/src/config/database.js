const { Sequelize } = require('sequelize');

const isPostgres = Boolean(process.env.DATABASE_URL);

let sequelize;
if (isPostgres) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DATABASE_SSL === 'false'
        ? false
        : {
            require: true,
            rejectUnauthorized: false,
          },
    },
  });
} else {
  const path = require('path');
  const dbPath = process.env.SQLITE_STORAGE
    ? path.resolve(process.env.SQLITE_STORAGE)
    : path.resolve(__dirname, '..', '..', 'backend_dev.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

module.exports = sequelize;
module.exports.isPostgres = isPostgres;
