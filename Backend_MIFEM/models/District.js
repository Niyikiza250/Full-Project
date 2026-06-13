const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const District = sequelize.define('District', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  fieldId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = District;
