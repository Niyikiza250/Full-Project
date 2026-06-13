const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ForumPost = sequelize.define('ForumPost', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  forumId: { type: DataTypes.UUID, allowNull: false },
  parentId: { type: DataTypes.UUID, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  authorName: { type: DataTypes.STRING, defaultValue: '' },
  body: { type: DataTypes.TEXT, allowNull: false },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  isResolved: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ForumPost;
