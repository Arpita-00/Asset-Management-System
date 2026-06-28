const express = require('express');
const router = express.Router();
const { BudgetForecast, Department } = require('../models');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const auditLogService = require('../services/auditLogService');

router.get('/', authenticate, async (req, res) => {
  const { departmentId, financialYear, quarter, forecastType } = req.query;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (financialYear) where.financialYear = financialYear;
  if (quarter) where.quarter = parseInt(quarter);
  if (forecastType) where.forecastType = forecastType;

  const forecasts = await BudgetForecast.findAll({
    where,
    include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }],
    order: [['financialYear', 'DESC'], ['quarter', 'ASC']]
  });

  res.status(200).json(ApiResponse.success(forecasts));
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const forecast = await BudgetForecast.create(req.body);
  const reloaded = await BudgetForecast.findByPk(forecast.id, {
    include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }]
  });
  await auditLogService.log('CREATE', 'BUDGET_FORECAST', forecast.id, null, reloaded.toJSON(), 'Budget forecast created', req.user.id, req);
  res.status(201).json(ApiResponse.created(reloaded, 'Budget forecast created successfully'));
});

router.get('/:id', authenticate, async (req, res) => {
  const forecast = await BudgetForecast.findByPk(req.params.id, {
    include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }]
  });
  if (!forecast) throw new ResourceNotFoundError('BudgetForecast', 'id', req.params.id);
  res.status(200).json(ApiResponse.success(forecast));
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const forecast = await BudgetForecast.findByPk(req.params.id);
  if (!forecast) throw new ResourceNotFoundError('BudgetForecast', 'id', req.params.id);
  
  const oldVal = forecast.toJSON();
  await forecast.update(req.body);
  
  const reloaded = await BudgetForecast.findByPk(forecast.id, {
    include: [{ model: Department, as: 'department', attributes: ['id', 'name', 'code'] }]
  });
  
  await auditLogService.log('UPDATE', 'BUDGET_FORECAST', forecast.id, oldVal, reloaded.toJSON(), 'Budget forecast updated', req.user.id, req);
  res.status(200).json(ApiResponse.success(reloaded, 'Budget forecast updated successfully'));
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const forecast = await BudgetForecast.findByPk(req.params.id);
  if (!forecast) throw new ResourceNotFoundError('BudgetForecast', 'id', req.params.id);
  
  const oldVal = forecast.toJSON();
  await forecast.destroy();
  
  await auditLogService.log('DELETE', 'BUDGET_FORECAST', req.params.id, oldVal, null, 'Budget forecast deleted', req.user.id, req);
  res.status(200).json(ApiResponse.success(null, 'Budget forecast deleted successfully'));
});

module.exports = router;
