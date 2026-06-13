const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SystemSetting = sequelize.define('SystemSetting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SystemSetting;
