const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ServiceHour = sequelize.define('ServiceHour', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  volunteerId: { type: DataTypes.UUID, allowNull: false },
  eventId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  hours: { type: DataTypes.DECIMAL(5, 1), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  approvedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ServiceHour;
