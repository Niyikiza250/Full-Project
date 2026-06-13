const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ministry = sequelize.define('Ministry', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  churchId: { type: DataTypes.UUID, allowNull: true },
  leaderId: { type: DataTypes.UUID, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Ministry;
