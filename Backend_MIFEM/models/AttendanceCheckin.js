const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AttendanceCheckin = sequelize.define('AttendanceCheckin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sessionId: { type: DataTypes.UUID, allowNull: false },
  memberId: { type: DataTypes.UUID, allowNull: true },
  memberName: { type: DataTypes.STRING, defaultValue: '' },
  method: { type: DataTypes.ENUM('QR', 'MANUAL', 'KIOSK'), defaultValue: 'MANUAL' },
  checkedInAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = AttendanceCheckin;
