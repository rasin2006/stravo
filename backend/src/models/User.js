const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { uuidPrimaryKey } = require('../config/dbTypes');

const User = sequelize.define('User', {
  id: uuidPrimaryKey(),
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

module.exports = User;
