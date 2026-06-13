const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AnnouncementRead = sequelize.define('AnnouncementRead', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  announcementId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  readAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = AnnouncementRead;
