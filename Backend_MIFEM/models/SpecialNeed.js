const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SpecialNeed = sequelize.define('SpecialNeed', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: false },
  needType: { type: DataTypes.ENUM('MOBILITY', 'HEARING', 'VISUAL', 'MEDICAL', 'DIETARY', 'OTHER'), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  accommodationProvided: { type: DataTypes.TEXT, defaultValue: '' },
  severity: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), defaultValue: 'MEDIUM' },
  status: { type: DataTypes.ENUM('ACTIVE', 'RESOLVED'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SpecialNeed;
