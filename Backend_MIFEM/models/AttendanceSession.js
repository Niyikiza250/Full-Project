const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AttendanceSession = sequelize.define('AttendanceSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  venue: { type: DataTypes.STRING, defaultValue: '' },
  present: { type: DataTypes.INTEGER, defaultValue: 0 },
  expected: { type: DataTypes.INTEGER, defaultValue: 0 },
  qrToken: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.ENUM('OPEN', 'CLOSED'), defaultValue: 'OPEN' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  fieldId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = AttendanceSession;
