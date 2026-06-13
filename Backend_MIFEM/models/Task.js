const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  assignedTo: { type: DataTypes.UUID, allowNull: true },
  assignedBy: { type: DataTypes.UUID, allowNull: true },
  fieldId: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
  status: { type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), defaultValue: 'PENDING' },
  priority: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'), defaultValue: 'MEDIUM' },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Task;
