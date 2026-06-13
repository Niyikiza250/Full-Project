const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Church = sequelize.define('Church', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  districtId: { type: DataTypes.UUID, allowNull: false },
  fieldId: { type: DataTypes.UUID, allowNull: true },
  zoneName: { type: DataTypes.STRING, defaultValue: '' },
  address: { type: DataTypes.TEXT, defaultValue: '' },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Church;
