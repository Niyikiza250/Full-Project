const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InternalMessage = sequelize.define('InternalMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  threadId: { type: DataTypes.UUID, allowNull: true },
  senderId: { type: DataTypes.UUID, allowNull: false },
  senderName: { type: DataTypes.STRING, defaultValue: '' },
  recipientId: { type: DataTypes.UUID, allowNull: true },
  recipientName: { type: DataTypes.STRING, defaultValue: '' },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = InternalMessage;
