const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User, Role, Department } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  isTokenExpired,
  buildClaims,
} = require('../utils/jwtUtils');
const { hashValue } = require('../utils/encryptionUtils');
const {
  ResourceNotFoundError,
  BadRequestError,
  BusinessError,
} = require('../middleware/errorHandler');
const auditLogService = require('./auditLogService');
const emailService = require('./emailService');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Authentication Service.
 * Handles login, register, refresh tokens, password management.
 */

// ─── Login ─────────────────────────────────────────────────────────────────

async function login(email, password) {
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, through: { attributes: [] } }],
  });

  if (!user) {
    throw new BadRequestError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new BusinessError('Account is deactivated. Contact administrator.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new BadRequestError('Invalid email or password');
  }

  const roles = user.Roles.map(r => r.name);
  const claims = buildClaims(user, roles);

  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefreshToken(claims);

  // Store hashed refresh token (mirrors passwordEncoder.encode(refreshToken))
  user.refreshToken = hashValue(refreshToken);
  user.lastLogin = new Date();
  user.lastLoginAt = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  await user.save();

  await auditLogService.log('LOGIN', 'USER', user.id, null, null,
    `User logged in: ${user.email}`);

  logger.info(`User logged in: ${user.email}`);
  return buildAuthResponse(user, roles, accessToken, refreshToken);
}

// ─── Register ───────────────────────────────────────────────────────────────

async function register(data) {
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) {
    throw new BadRequestError(`Email already registered: ${data.email}`);
  }

  let department = null;
  if (data.departmentId) {
    department = await Department.findByPk(data.departmentId);
    if (!department) {
      throw new ResourceNotFoundError('Department', 'id', data.departmentId);
    }
  }

  const roleName = data.role || 'ROLE_EMPLOYEE';
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) {
    throw new ResourceNotFoundError('Role', 'name', roleName);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    departmentId: department ? department.id : null,
    isActive: true,
    isEmailVerified: false,
  });

  await user.addRole(role);

  const roles = [roleName];
  const claims = buildClaims(user, roles);
  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefreshToken(claims);

  user.refreshToken = hashValue(refreshToken);
  await user.save();

  // Reload with associations
  await user.reload({ include: [{ model: Role, through: { attributes: [] } }] });

  await auditLogService.log('REGISTER', 'USER', user.id, null,
    { email: user.email, role: roleName }, 'New user registered');

  logger.info(`New user registered: ${user.email}`);
  return buildAuthResponse(user, roles, accessToken, refreshToken);
}

// ─── Refresh Token ──────────────────────────────────────────────────────────

async function refreshToken(token) {
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new BusinessError('Refresh token has expired. Please login again.');
    }
    throw new BadRequestError('Invalid refresh token');
  }

  const user = await User.findOne({
    where: { email: decoded.sub },
    include: [{ model: Role, through: { attributes: [] } }],
  });
  if (!user) {
    throw new ResourceNotFoundError('User', 'email', decoded.sub);
  }

  const roles = user.Roles.map(r => r.name);
  const claims = buildClaims(user, roles);

  const newAccessToken = generateAccessToken(claims);
  const newRefreshToken = generateRefreshToken(claims);

  user.refreshToken = hashValue(newRefreshToken);
  await user.save();

  return buildAuthResponse(user, roles, newAccessToken, newRefreshToken);
}

// ─── Forgot Password ────────────────────────────────────────────────────────

async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Security: don't reveal if email exists
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  const token = uuidv4();
  user.passwordResetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  await emailService.sendPasswordResetEmail(user.email, user.firstName, token);
  logger.info(`Password reset token sent to: ${user.email}`);
}

// ─── Reset Password ─────────────────────────────────────────────────────────

async function resetPassword(token, newPassword) {
  const user = await User.findOne({ where: { passwordResetToken: token } });
  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token.');
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new BadRequestError('Password reset token has expired. Please request a new one.');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  logger.info(`Password reset successful for: ${user.email}`);
  await auditLogService.log('RESET_PASSWORD', 'USER', user.id, null, null, 'Password reset');
}

// ─── Change Password ────────────────────────────────────────────────────────

async function changePassword(email, currentPassword, newPassword, confirmPassword) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ResourceNotFoundError('User', 'email', email);
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    throw new BadRequestError('Current password is incorrect.');
  }

  if (newPassword !== confirmPassword) {
    throw new BadRequestError('New password and confirm password do not match.');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await auditLogService.log('CHANGE_PASSWORD', 'USER', user.id, null, null, 'Password changed');
}

// ─── Logout ────────────────────────────────────────────────────────────────

async function logout(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ResourceNotFoundError('User', 'email', email);
  }

  user.refreshToken = null;
  await user.save();

  await auditLogService.log('LOGOUT', 'USER', user.id, null, null, 'User logged out');
}

// ─── Get Profile ────────────────────────────────────────────────────────────

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    include: [
      { model: Role, through: { attributes: [] } },
      { model: Department, as: 'department' },
    ],
    attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'resetTokenExpiry'] },
  });
  if (!user) throw new ResourceNotFoundError('User', 'id', userId);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount,
    lastLoginAt: user.lastLoginAt,
    department: user.department ? { id: user.department.id, name: user.department.name } : null,
    roles: user.Roles ? user.Roles.map(r => r.name) : [],
    emailAlerts: user.emailAlerts,
    maintenanceUpdates: user.maintenanceUpdates,
    systemAudits: user.systemAudits,
    createdAt: user.createdAt,
  };
}

async function updateProfile(userId, data) {
  const user = await User.findByPk(userId);
  if (!user) throw new ResourceNotFoundError('User', 'id', userId);

  if (data.firstName !== undefined) user.firstName = data.firstName;
  if (data.lastName !== undefined) user.lastName = data.lastName;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.emailAlerts !== undefined) user.emailAlerts = Boolean(data.emailAlerts);
  if (data.maintenanceUpdates !== undefined) user.maintenanceUpdates = Boolean(data.maintenanceUpdates);
  if (data.systemAudits !== undefined) user.systemAudits = Boolean(data.systemAudits);

  await user.save();
  return getProfile(userId);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildAuthResponse(user, roles, accessToken, refreshToken) {
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: Math.floor(config.jwt.accessExpiry / 1000),
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    roles,
    loginCount: user.loginCount,
    lastLoginAt: user.lastLoginAt,
    department: user.department ? user.department.name : null,
    emailAlerts: user.emailAlerts,
    maintenanceUpdates: user.maintenanceUpdates,
    systemAudits: user.systemAudits,
  };
}

module.exports = {
  login,
  register,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getProfile,
  updateProfile,
};
