const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Union = sequelize.define('Union', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  code: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.TEXT, defaultValue: '' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Union;
