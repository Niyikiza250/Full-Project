const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  kind: {
    type: DataTypes.ENUM('STORY', 'GALLERY', 'TESTIMONY', 'NEWS'),
    defaultValue: 'STORY',
  },
  title: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  summary: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  coverUrl: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  publishedAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'APPROVED',
  },
  submittedBy: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  submittedByRole: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  galleryUrls: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Achievement;
