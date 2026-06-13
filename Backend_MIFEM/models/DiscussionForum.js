const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DiscussionForum = sequelize.define('DiscussionForum', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.ENUM('GENERAL', 'PRAYER', 'STUDY', 'MINISTRY', 'ANNOUNCEMENTS'), defaultValue: 'GENERAL' },
  status: { type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
  lastActivityAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = DiscussionForum;
