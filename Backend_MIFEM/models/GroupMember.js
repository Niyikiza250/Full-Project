const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupId: { type: DataTypes.UUID, allowNull: false },
  memberId: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM('LEADER', 'ASSISTANT', 'MEMBER'), defaultValue: 'MEMBER' },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = GroupMember;
