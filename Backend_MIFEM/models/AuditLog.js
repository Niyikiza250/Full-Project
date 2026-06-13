const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actor: { type: DataTypes.UUID, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false },
  target: { type: DataTypes.STRING, defaultValue: '' },
  targetType: { type: DataTypes.STRING, defaultValue: '' },
  severity: { type: DataTypes.ENUM('INFO', 'WARN', 'CRITICAL'), defaultValue: 'INFO' },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
  ipAddress: { type: DataTypes.STRING, defaultValue: '' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = AuditLog;
