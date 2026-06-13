const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Volunteer = sequelize.define('Volunteer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, lowercase: true, trim: true },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  password: { type: DataTypes.STRING, allowNull: false },
  profilePicture: { type: DataTypes.TEXT, defaultValue: '' },
  location: { type: DataTypes.STRING, defaultValue: '' },
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
  skills: { type: DataTypes.JSONB, defaultValue: [] },
  availability: { type: DataTypes.JSONB, defaultValue: {} },
  totalServiceHours: { type: DataTypes.DECIMAL(10, 1), defaultValue: 0 },
  recognitionPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  updatedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Volunteer;
