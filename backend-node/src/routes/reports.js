const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');
const reportService = require('../services/reportService');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: PDF and Excel report generation
 */

// ─── Asset Reports ────────────────────────────────────────────────────────────

router.get('/assets', authenticate, async (req, res) => {
  const { format = 'pdf', status } = req.query;
  if (format === 'excel') {
    const buffer = await reportService.generateAssetReportExcel(status);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="asset-report.xlsx"`);
    res.send(buffer);
  } else {
    const buffer = await reportService.generateAssetReportPdf(status);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="asset-report.pdf"`);
    res.send(buffer);
  }
});

// ─── Maintenance Reports ──────────────────────────────────────────────────────

router.get('/maintenance', authenticate, async (req, res) => {
  const { format = 'pdf' } = req.query;
  if (format === 'excel') {
    const buffer = await reportService.generateMaintenanceReportExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.xlsx"');
    res.send(buffer);
  } else {
    const buffer = await reportService.generateMaintenanceReportPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.pdf"');
    res.send(buffer);
  }
});

// ─── Warranty Reports ─────────────────────────────────────────────────────────

router.get('/warranty', authenticate, async (req, res) => {
  const { format = 'pdf', days = 30 } = req.query;
  if (format === 'excel') {
    const buffer = await reportService.generateWarrantyReportExcel(parseInt(days));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="warranty-report.xlsx"');
    res.send(buffer);
  } else {
    const buffer = await reportService.generateWarrantyReportPdf(parseInt(days));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="warranty-report.pdf"');
    res.send(buffer);
  }
});

// ─── Depreciation Reports ─────────────────────────────────────────────────────

router.get('/depreciation', authenticate, async (req, res) => {
  const { format = 'pdf', financialYear } = req.query;
  if (format === 'excel') {
    const buffer = await reportService.generateDepreciationReportExcel(financialYear);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="depreciation-report.xlsx"');
    res.send(buffer);
  } else {
    const buffer = await reportService.generateDepreciationReportPdf(financialYear);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="depreciation-report.pdf"');
    res.send(buffer);
  }
});

// ─── Single Asset Passport PDF ───────────────────────────────────────────────

router.get('/assets/:assetId', authenticate, async (req, res) => {
  const buffer = await reportService.generateSingleAssetPdf(req.params.assetId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="asset-passport-${req.params.assetId}.pdf"`);
  res.send(buffer);
});

module.exports = router;
