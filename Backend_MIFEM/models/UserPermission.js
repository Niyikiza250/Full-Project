const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPermission = sequelize.define('UserPermission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  permissionId: { type: DataTypes.UUID, allowNull: false },
  grantedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = UserPermission;
