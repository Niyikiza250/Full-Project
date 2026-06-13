const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, lowercase: true, trim: true },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  gender: { type: DataTypes.ENUM('MALE', 'FEMALE'), allowNull: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  baptismDate: { type: DataTypes.DATEONLY, allowNull: true },
  registrationType: { type: DataTypes.ENUM('MEMBER', 'VOLUNTEER'), defaultValue: 'MEMBER' },
  address: { type: DataTypes.TEXT, defaultValue: '' },
  
  // Location fields
  provinceCode: { type: DataTypes.INTEGER, allowNull: true },
  provinceName: { type: DataTypes.STRING, allowNull: true },
  districtCode: { type: DataTypes.INTEGER, allowNull: true },
  districtName: { type: DataTypes.STRING, allowNull: true },
  sectorCode: { type: DataTypes.STRING, allowNull: true },
  sectorName: { type: DataTypes.STRING, allowNull: true },
  cellCode: { type: DataTypes.INTEGER, allowNull: true },
  cellName: { type: DataTypes.STRING, allowNull: true },
  villageCode: { type: DataTypes.INTEGER, allowNull: true },
  villageName: { type: DataTypes.STRING, allowNull: true },
  
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED', 'VISITOR', 'SUSPENDED'), defaultValue: 'ACTIVE' },
  sabbathClass: { type: DataTypes.STRING, defaultValue: '' },
  imageUrl: { type: DataTypes.TEXT, defaultValue: '' },
  churchId: { type: DataTypes.UUID, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  updatedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Member;
