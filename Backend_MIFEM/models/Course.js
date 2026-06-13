const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Course = sequelize.define('Course', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  category: { type: DataTypes.ENUM('BIBLE_STUDY', 'LEADERSHIP', 'WOMENS_MINISTRY', 'CHILDRENS_MINISTRY', 'HEALTH', 'MUSIC', 'OTHER'), defaultValue: 'OTHER' },
  difficulty: { type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'), defaultValue: 'BEGINNER' },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.TEXT, defaultValue: '' },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'), defaultValue: 'DRAFT' },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Course;
