const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MemberChangeRequest = sequelize.define('MemberChangeRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: true },
  type: { type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'), defaultValue: 'UPDATE' },
  changes: { type: DataTypes.JSONB, defaultValue: {} },
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
  submittedBy: { type: DataTypes.UUID, allowNull: false },
  submittedByRole: { type: DataTypes.STRING, defaultValue: '' },
  reviewedBy: { type: DataTypes.UUID, allowNull: true },
  reviewedAt: { type: DataTypes.DATE, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = MemberChangeRequest;
