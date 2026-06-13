const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LoginSession = sequelize.define('LoginSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  token: { type: DataTypes.TEXT, allowNull: false },
  ipAddress: { type: DataTypes.STRING, defaultValue: '' },
  userAgent: { type: DataTypes.TEXT, defaultValue: '' },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  loggedOutAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = LoginSession;
