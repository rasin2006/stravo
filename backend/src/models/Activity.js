const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { uuidPrimaryKey, uuidForeignKey, isPostgres } = require('../config/dbTypes');

const Activity = sequelize.define('Activity', {
  id: uuidPrimaryKey(),
  userId: uuidForeignKey(),
  title: { type: DataTypes.STRING, allowNull: false },
  distanceMeters: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: false },
  elevationGainMeters: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  startLocation: {
    type: isPostgres ? DataTypes.GEOGRAPHY('POINT') : DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Activity;
