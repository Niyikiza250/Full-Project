const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, lowercase: true, trim: true },
  password: { type: DataTypes.STRING, allowNull: false },
  profilePicture: { type: DataTypes.TEXT, defaultValue: '' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  location: { type: DataTypes.STRING, defaultValue: '' },
  accountStatus: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'INVITED', 'LOCKED'), defaultValue: 'ACTIVE' },
  temporaryPasswordStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  mfaEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  excelImportAllowedRoles: { type: DataTypes.JSONB, defaultValue: [] },
  rolePermissions: { type: DataTypes.JSONB, defaultValue: [] },
  unionId: { type: DataTypes.UUID, allowNull: true },
  fieldId: { type: DataTypes.UUID, allowNull: true },
  districtId: { type: DataTypes.UUID, allowNull: true },
  churchId: { type: DataTypes.UUID, allowNull: true },
  ministryId: { type: DataTypes.UUID, allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  assignedBy: { type: DataTypes.UUID, allowNull: true },
  assignedRole: { type: DataTypes.STRING, allowNull: true },
  roleAssignedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
  paranoid: true,
  underscored: true,
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
