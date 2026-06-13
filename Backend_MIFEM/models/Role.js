const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  hierarchy: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Role;
