const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { isPostgres } = require('./database');

const uuidPrimaryKey = () => ({
  type: isPostgres ? DataTypes.UUID : DataTypes.STRING(36),
  defaultValue: isPostgres ? DataTypes.UUIDV4 : () => crypto.randomUUID(),
  primaryKey: true,
});

const uuidForeignKey = (allowNull = false) => ({
  type: isPostgres ? DataTypes.UUID : DataTypes.STRING(36),
  allowNull,
});

module.exports = { uuidPrimaryKey, uuidForeignKey, isPostgres };
