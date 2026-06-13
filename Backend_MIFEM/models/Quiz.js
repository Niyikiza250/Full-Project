const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  lessonId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  passingScore: { type: DataTypes.INTEGER, defaultValue: 70 },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 3 },
  questions: { type: DataTypes.JSONB, defaultValue: [] },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED'), defaultValue: 'DRAFT' },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Quiz;
