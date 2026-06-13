const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SmsTemplate = sequelize.define('SmsTemplate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  body: { type: DataTypes.TEXT, allowNull: false },
  lastUsed: { type: DataTypes.DATE, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SmsTemplate;
