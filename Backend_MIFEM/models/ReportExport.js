const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ReportExport = sequelize.define('ReportExport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  reportType: { type: DataTypes.STRING, allowNull: false },
  parameters: { type: DataTypes.JSONB, defaultValue: {} },
  format: { type: DataTypes.ENUM('CSV', 'PDF', 'EXCEL'), defaultValue: 'CSV' },
  status: { type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'), defaultValue: 'PENDING' },
  fileUrl: { type: DataTypes.TEXT, defaultValue: '' },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ReportExport;
