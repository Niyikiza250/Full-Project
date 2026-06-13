const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GroupMessage = sequelize.define('GroupMessage', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  type: { type: DataTypes.ENUM('MINISTRY', 'DISTRICT', 'FIELD', 'CHURCH', 'CUSTOM'), defaultValue: 'CUSTOM' },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = GroupMessage;
