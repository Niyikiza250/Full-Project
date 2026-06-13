const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventTimeline = sequelize.define('EventTimeline', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  time: { type: DataTypes.STRING, defaultValue: '' },
  activity: { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = EventTimeline;
