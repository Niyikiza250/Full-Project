const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  priority: { type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'), defaultValue: 'NORMAL' },
  category: { type: DataTypes.ENUM('GENERAL', 'TRAINING', 'SPIRITUAL', 'FINANCE', 'YOUTH'), defaultValue: 'GENERAL' },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  author: { type: DataTypes.STRING, defaultValue: '' },
  authorRole: { type: DataTypes.STRING, defaultValue: '' },
  targetRole: { type: DataTypes.STRING, allowNull: true },
  targetId: { type: DataTypes.UUID, allowNull: true },
  senderId: { type: DataTypes.UUID, allowNull: false },
  unionId: { type: DataTypes.UUID, allowNull: true },
  fieldId: { type: DataTypes.UUID, allowNull: true },
  districtId: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Announcement;
