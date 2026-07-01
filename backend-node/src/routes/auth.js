const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.status(200).json(ApiResponse.success(data, 'Login successful'));
});

const { requireAdmin } = require('../middleware/rbac');

router.post('/register', authenticate, requireAdmin, async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json(ApiResponse.created(data, 'User registered successfully'));
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(ApiResponse.error(400, 'Refresh token is required'));
  }
  const data = await authService.refreshToken(refreshToken);
  res.status(200).json(ApiResponse.success(data, 'Token refreshed'));
});

router.post('/forgot-password', async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json(ApiResponse.success(null, 'If the email exists, a reset link has been sent.'));
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.status(200).json(ApiResponse.success(null, 'Password reset successfully.'));
});

router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  await authService.changePassword(req.user.email, currentPassword, newPassword, confirmPassword);
  res.status(200).json(ApiResponse.success(null, 'Password changed successfully.'));
});

router.post('/logout', authenticate, async (req, res) => {
  await authService.logout(req.user.email);
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully.'));
});

router.get('/profile', authenticate, async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.status(200).json(ApiResponse.success(data));
});

router.get('/me', authenticate, async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.status(200).json(ApiResponse.success(data));
});

router.put('/profile', authenticate, async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json(ApiResponse.success(data, 'Profile updated successfully'));
});

module.exports = router;
