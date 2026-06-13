const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventRegistration = sequelize.define('EventRegistration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false },
  memberId: { type: DataTypes.UUID, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  memberName: { type: DataTypes.STRING, defaultValue: '' },
  status: { type: DataTypes.ENUM('REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED'), defaultValue: 'REGISTERED' },
  registeredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = EventRegistration;
