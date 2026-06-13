const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CounselingRequest = sequelize.define('CounselingRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  counselingType: { type: DataTypes.ENUM('MARITAL', 'GRIEF', 'FINANCIAL', 'SPIRITUAL', 'FAMILY', 'ADDICTION', 'OTHER'), defaultValue: 'OTHER' },
  description: { type: DataTypes.TEXT, allowNull: false },
  isConfidential: { type: DataTypes.BOOLEAN, defaultValue: true },
  urgency: { type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'), defaultValue: 'NORMAL' },
  status: { type: DataTypes.ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'), defaultValue: 'PENDING' },
  assignedTo: { type: DataTypes.UUID, allowNull: true },
  assignedAt: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  followUpDate: { type: DataTypes.DATEONLY, allowNull: true },
  followUpNotes: { type: DataTypes.TEXT, defaultValue: '' },
  sessionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = CounselingRequest;
