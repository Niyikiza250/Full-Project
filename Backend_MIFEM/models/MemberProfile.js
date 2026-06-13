const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MemberProfile = sequelize.define('MemberProfile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  memberId: { type: DataTypes.UUID, allowNull: false, unique: true },
  occupation: { type: DataTypes.STRING, defaultValue: '' },
  education: { type: DataTypes.STRING, defaultValue: '' },
  skills: { type: DataTypes.JSONB, defaultValue: [] },
  emergencyContact: { type: DataTypes.STRING, defaultValue: '' },
  emergencyPhone: { type: DataTypes.STRING, defaultValue: '' },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = MemberProfile;
