const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MemberMinistryRole = sequelize.define('MemberMinistryRole', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: false },
  role: {
    type: DataTypes.ENUM(
      'CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
      'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
      'COMMUNITY_SERVICES', 'OTHER',
    ),
    allowNull: false,
  },
  assignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  assignedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: false,
  underscored: true,
  tableName: 'MemberMinistryRoles',
  indexes: [
    { unique: true, fields: ['member_id', 'role'] },
  ],
});

module.exports = MemberMinistryRole;
