const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: false },
  certificateNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('ISSUED', 'REVOKED'), defaultValue: 'ISSUED' },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
  issuedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Certificate;
