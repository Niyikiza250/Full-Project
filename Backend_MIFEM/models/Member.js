const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  // Personal information
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  gender: { type: DataTypes.ENUM('MALE', 'FEMALE'), allowNull: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  ageGroup: { type: DataTypes.ENUM('YOUTH', 'YOUNG_ADULT', 'ADULT', 'SENIOR'), allowNull: true },
  imageUrl: { type: DataTypes.TEXT, defaultValue: '' },

  // Contact information
  email: { type: DataTypes.STRING(255), allowNull: true, lowercase: true, trim: true },
  phone: { type: DataTypes.STRING(20), allowNull: false, defaultValue: '' },
  whatsapp: { type: DataTypes.STRING(20), allowNull: true },

  // Church affiliation
  churchId: { type: DataTypes.UUID, allowNull: true },
  sabbathClass: { type: DataTypes.STRING(100), defaultValue: '' },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'),
    defaultValue: 'MEMBER',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED', 'VISITOR', 'SUSPENDED'),
    defaultValue: 'ACTIVE',
  },
  baptismDate: { type: DataTypes.DATEONLY, allowNull: true },
  registrationType: { type: DataTypes.ENUM('MEMBER', 'VOLUNTEER'), defaultValue: 'MEMBER' },

  // Address (manual entry for MEMBER type)
  address: { type: DataTypes.TEXT, defaultValue: '' },
  village: { type: DataTypes.STRING(100), allowNull: true },
  sector: { type: DataTypes.STRING(100), allowNull: true },
  district: { type: DataTypes.STRING(100), allowNull: true },

  // Location fields (cascading dropdowns for VOLUNTEER type)
  provinceCode: { type: DataTypes.STRING, allowNull: true },
  provinceName: { type: DataTypes.STRING, allowNull: true },
  districtCode: { type: DataTypes.STRING, allowNull: true },
  districtName: { type: DataTypes.STRING, allowNull: true },
  sectorCode: { type: DataTypes.STRING, allowNull: true },
  sectorName: { type: DataTypes.STRING, allowNull: true },
  cellCode: { type: DataTypes.STRING, allowNull: true },
  cellName: { type: DataTypes.STRING, allowNull: true },
  villageCode: { type: DataTypes.STRING, allowNull: true },
  villageName: { type: DataTypes.STRING, allowNull: true },

  // Emergency contact
  emergencyName: { type: DataTypes.STRING(100), allowNull: true },
  emergencyPhone: { type: DataTypes.STRING(20), allowNull: true },

  // Audit
  createdBy: { type: DataTypes.UUID, allowNull: true },
  updatedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
  tableName: 'Members',
});

module.exports = Member;
