const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.ENUM('WORSHIP', 'CONFERENCE', 'COMMUNITY', 'YOUTH', 'TRAINING', 'OTHER'), defaultValue: 'OTHER' },
  status: { type: DataTypes.ENUM('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'), defaultValue: 'DRAFT' },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING, defaultValue: '' },
  organizer: { type: DataTypes.STRING, defaultValue: '' },
  maxAttendees: { type: DataTypes.INTEGER, allowNull: true },
  currentAttendees: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.TEXT, defaultValue: '' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  fieldId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Event;
