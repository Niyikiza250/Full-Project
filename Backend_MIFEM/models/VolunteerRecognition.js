const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VolunteerRecognition = sequelize.define('VolunteerRecognition', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  volunteerId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('CERTIFICATE', 'AWARD', 'THANK_YOU', 'SPOTLIGHT', 'MILESTONE'), defaultValue: 'THANK_YOU' },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  dateAwarded: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  awardedBy: { type: DataTypes.UUID, allowNull: true },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = VolunteerRecognition;
