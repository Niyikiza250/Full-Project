const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MemberActivity = sequelize.define('MemberActivity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('BAPTISM', 'TRANSFER', 'ROLE_CHANGE', 'OFFICE_APPOINTMENT', 'NOTE'), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  date: { type: DataTypes.DATEONLY, allowNull: true },
  performedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = MemberActivity;
