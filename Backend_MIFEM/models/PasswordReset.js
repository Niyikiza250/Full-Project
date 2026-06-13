const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PasswordReset = sequelize.define('PasswordReset', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = PasswordReset;
