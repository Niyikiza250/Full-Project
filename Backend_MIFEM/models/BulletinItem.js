const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BulletinItem = sequelize.define('BulletinItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.TEXT, defaultValue: '' },
  pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: { type: DataTypes.STRING, defaultValue: '' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = BulletinItem;
