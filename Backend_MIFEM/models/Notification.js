const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('EVENT_REMINDER', 'TASK_REMINDER', 'MESSAGE', 'PRAYER_UPDATE', 'COUNSELING_UPDATE', 'COURSE_COMPLETE', 'CERTIFICATE', 'ANNOUNCEMENT', 'SYSTEM'), allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, defaultValue: '' },
  data: { type: DataTypes.JSONB, defaultValue: {} },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  sentVia: { type: DataTypes.JSONB, defaultValue: ['IN_APP'] },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Notification;
