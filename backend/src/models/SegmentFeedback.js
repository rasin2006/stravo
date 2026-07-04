const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { uuidPrimaryKey, uuidForeignKey } = require('../config/dbTypes');

const SegmentFeedback = sequelize.define(
  'SegmentFeedback',
  {
    id: uuidPrimaryKey(),
    userId: uuidForeignKey(),
    activitySegmentId: uuidForeignKey(),
    isInteresting: { type: DataTypes.BOOLEAN, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    indexes: [{ unique: true, fields: ['activitySegmentId', 'userId'] }],
  }
);

module.exports = SegmentFeedback;
