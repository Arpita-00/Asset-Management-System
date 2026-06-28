const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

router.get('/stats', authenticate, async (req, res) => {
  const data = await dashboardService.getStats();
  res.status(200).json(ApiResponse.success(data));
});

router.get('/category', authenticate, async (req, res) => {
  const data = await dashboardService.getCategoryDistribution();
  res.status(200).json(ApiResponse.success(data));
});

router.get('/department', authenticate, async (req, res) => {
  const data = await dashboardService.getDepartmentDistribution();
  res.status(200).json(ApiResponse.success(data));
});

router.get('/status', authenticate, async (req, res) => {
  const data = await dashboardService.getStatusDistribution();
  res.status(200).json(ApiResponse.success(data));
});

const { resetAndSeedDatabase } = require('../config/seeder');

router.get('/health', authenticate, async (req, res) => {
  const data = await dashboardService.getHealthDistribution();
  res.status(200).json(ApiResponse.success(data));
});

router.post('/demo-reset', authenticate, async (req, res) => {
  try {
    await resetAndSeedDatabase();
    res.status(200).json(ApiResponse.success({ message: 'Zonal database reset completed successfully!' }));
  } catch (err) {
    res.status(500).json(ApiResponse.error('Reseed failed: ' + err.message));
  }
});

module.exports = router;
