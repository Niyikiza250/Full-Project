const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SmallGroup = sequelize.define('SmallGroup', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.ENUM('BIBLE_STUDY', 'FELLOWSHIP', 'PRAYER', 'INTEREST', 'SUPPORT', 'OTHER'), defaultValue: 'FELLOWSHIP' },
  leaderId: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  maxMembers: { type: DataTypes.INTEGER, defaultValue: 15 },
  meetingSchedule: { type: DataTypes.STRING, defaultValue: '' },
  meetingLocation: { type: DataTypes.STRING, defaultValue: '' },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = SmallGroup;
