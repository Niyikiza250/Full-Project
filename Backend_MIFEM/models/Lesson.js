const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  courseId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, defaultValue: '' },
  videoUrl: { type: DataTypes.TEXT, defaultValue: '' },
  duration: { type: DataTypes.INTEGER, defaultValue: 0 },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED'), defaultValue: 'DRAFT' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Lesson;
