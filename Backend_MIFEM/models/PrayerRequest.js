const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PrayerRequest = sequelize.define('PrayerRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  prayerType: { type: DataTypes.ENUM('PERSONAL', 'FAMILY', 'HEALTH', 'FINANCIAL', 'SPIRITUAL', 'OTHER'), defaultValue: 'PERSONAL' },
  request: { type: DataTypes.TEXT, allowNull: false },
  isConfidential: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('PENDING', 'PRAYING', 'ANSWERED', 'CLOSED'), defaultValue: 'PENDING' },
  assignedTo: { type: DataTypes.UUID, allowNull: true },
  followUpDate: { type: DataTypes.DATEONLY, allowNull: true },
  answeredAt: { type: DataTypes.DATE, allowNull: true },
  answerDescription: { type: DataTypes.TEXT, defaultValue: '' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = PrayerRequest;
