const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * User model.
 * Sensitive fields (email, phone) are AES-256-GCM encrypted at rest.
 */
const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(50), allowNull: false, field: 'firstName' },
  lastName: { type: DataTypes.STRING(50), allowNull: false, field: 'lastName' },
  // email stored encrypted at application layer
  email: { type: DataTypes.STRING(500), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  // phone stored encrypted
  phone: { type: DataTypes.STRING(500) },
  avatarUrl: { type: DataTypes.STRING(500), field: 'avatarUrl' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'isEmailVerified' },
  lastLogin: { type: DataTypes.DATE, field: 'lastLogin' },
  loginCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'loginCount' },
  lastLoginAt: { type: DataTypes.DATE, field: 'lastLoginAt' },
  // Stored as SHA-256 hash of the actual refresh token
  refreshToken: { type: DataTypes.TEXT, field: 'refreshToken' },
  passwordResetToken: { type: DataTypes.STRING(255), field: 'passwordResetToken' },
  resetTokenExpiry: { type: DataTypes.DATE, field: 'resetTokenExpiry' },
  departmentId: { type: DataTypes.BIGINT, field: 'department_id' },
  emailAlerts: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'emailAlerts' },
  maintenanceUpdates: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'maintenanceUpdates' },
  systemAudits: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'systemAudits' },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
