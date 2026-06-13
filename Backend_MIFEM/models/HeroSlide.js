const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HeroSlide = sequelize.define('HeroSlide', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  bgColor: {
    type: DataTypes.STRING,
    defaultValue: 'bg-slate-900',
  },
  overlayFrom: {
    type: DataTypes.STRING,
    defaultValue: 'from-slate-900/80',
  },
  overlayTo: {
    type: DataTypes.STRING,
    defaultValue: 'to-slate-950/60',
  },
  bgImage: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  primaryCta: {
    type: DataTypes.JSONB,
    defaultValue: { label: '', href: '' },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = HeroSlide;
