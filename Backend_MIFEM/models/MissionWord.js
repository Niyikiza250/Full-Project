const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MissionWord = sequelize.define('MissionWord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  cardId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, defaultValue: '' },
  body: { type: DataTypes.TEXT, defaultValue: '' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = MissionWord;
