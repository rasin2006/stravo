const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Segment = sequelize.define('Segment', {
  // This model is being repurposed or removed based on the focus on ActivitySegment.
  // For now, I'm making it a placeholder or removing its usage.
  // If you intend to have 'predefined' segments, this model would be for them.
  // For the current scope, ActivitySegment is the primary segment type.
  // I will comment out its definition to avoid conflicts and simplify.
  // If you need predefined segments, uncomment and define appropriately.
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  geometry: { type: DataTypes.GEOMETRY('LineString', 4326), allowNull: false },
  lengthMeters: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

module.exports = Segment;
