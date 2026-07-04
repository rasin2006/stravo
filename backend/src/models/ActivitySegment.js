const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { uuidPrimaryKey, uuidForeignKey } = require('../config/dbTypes');

const ActivitySegment = sequelize.define('ActivitySegment', {
  id: uuidPrimaryKey(),
  activityId: uuidForeignKey(),
  startPointId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  endPointId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  segmentPath: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('segmentPath');
      if (!raw) return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    },
    set(value) {
      if (!value) {
        this.setDataValue('segmentPath', null);
        return;
      }
      this.setDataValue('segmentPath', JSON.stringify(value));
    },
  },
  lengthMeters: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = ActivitySegment;
