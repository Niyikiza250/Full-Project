const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BlueCard = sequelize.define('BlueCard', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  congregationLabel: { type: DataTypes.STRING, defaultValue: '' },
  mainTitle: { type: DataTypes.STRING, defaultValue: '' },
  welcomeMessage: { type: DataTypes.TEXT, defaultValue: '' },
  missionWordsLabel: { type: DataTypes.STRING, defaultValue: '' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = BlueCard;
