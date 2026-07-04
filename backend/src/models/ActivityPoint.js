const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { uuidForeignKey } = require('../config/dbTypes');

const ActivityPoint = sequelize.define('ActivityPoint', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  activityId: uuidForeignKey(),
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  elevation: { type: DataTypes.FLOAT, allowNull: true },
  accuracy: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
});

module.exports = ActivityPoint;
