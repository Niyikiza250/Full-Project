const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailSubscription = sequelize.define('EmailSubscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = EmailSubscription;
