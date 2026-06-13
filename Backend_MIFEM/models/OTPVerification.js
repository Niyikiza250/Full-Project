const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OTPVerification = sequelize.define('OTPVerification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  otp: { type: DataTypes.STRING(6), allowNull: false },
  type: { type: DataTypes.ENUM('LOGIN', 'PASSWORD_RESET', 'MFA'), defaultValue: 'LOGIN' },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  verifiedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = OTPVerification;
