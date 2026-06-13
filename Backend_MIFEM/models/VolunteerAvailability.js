const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VolunteerAvailability = sequelize.define('VolunteerAvailability', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  volunteerId: { type: DataTypes.UUID, allowNull: false },
  dayOfWeek: { type: DataTypes.INTEGER, allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = VolunteerAvailability;
