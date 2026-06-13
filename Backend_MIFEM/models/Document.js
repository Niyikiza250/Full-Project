const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Document = sequelize.define('Document', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.ENUM('REPORT', 'FORM', 'GUIDELINE', 'POLICY', 'CURRICULUM', 'DEVOTIONAL', 'OTHER'), defaultValue: 'OTHER' },
  fileUrl: { type: DataTypes.TEXT, defaultValue: '' },
  fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
  fileType: { type: DataTypes.STRING, defaultValue: '' },
  status: { type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Document;
