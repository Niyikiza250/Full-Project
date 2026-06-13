const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quizId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalQuestions: { type: DataTypes.INTEGER, defaultValue: 0 },
  correctAnswers: { type: DataTypes.INTEGER, defaultValue: 0 },
  answers: { type: DataTypes.JSONB, defaultValue: [] },
  passed: { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = QuizAttempt;
