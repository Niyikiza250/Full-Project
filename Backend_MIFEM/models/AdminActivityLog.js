const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminActivityLog = sequelize.define('AdminActivityLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = AdminActivityLog;
