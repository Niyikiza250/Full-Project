const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  group: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Permission;
