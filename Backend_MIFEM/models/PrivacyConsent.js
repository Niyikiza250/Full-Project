const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PrivacyConsent = sequelize.define('PrivacyConsent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: false },
  consentType: { type: DataTypes.ENUM('DATA_PROCESSING', 'PHOTO', 'CONTACT_SHARING', 'NEWSLETTER', 'RESEARCH', 'THIRD_PARTY'), allowNull: false },
  granted: { type: DataTypes.BOOLEAN, defaultValue: false },
  grantedAt: { type: DataTypes.DATE, allowNull: true },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
  ipAddress: { type: DataTypes.STRING, defaultValue: '' },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = PrivacyConsent;
