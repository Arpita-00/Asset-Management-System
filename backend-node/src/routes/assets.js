const express = require('express');
const router = express.Router();
const assetService = require('../services/assetService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');
const multer = require('multer');
const path = require('path');
const config = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.app.uploadDir);
  },
  filename: (req, file, cb) => {
    const assetId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `asset_image_${assetId}${ext}`);
  }
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'));
    }
  }
});

router.get('/', authenticate, async (req, res) => {
  const { search, status, categoryId, departmentId, page = 0, size = 10, sortBy, sortDir } = req.query;
  const data = await assetService.getAssets({ search, status, categoryId, departmentId, page: parseInt(page), size: parseInt(size), sortBy, sortDir });
  res.status(200).json(ApiResponse.success(data));
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const data = await assetService.createAsset(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Asset created successfully'));
});

router.get('/stats', authenticate, async (req, res) => {
  const data = await assetService.getStatusCounts();
  res.status(200).json(ApiResponse.success(data));
});

// ─── Categories Management ───────────────────────────────────────────────────

router.get('/categories', authenticate, async (req, res) => {
  const { AssetCategory } = require('../models');
  const data = await AssetCategory.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']]
  });
  res.status(200).json(ApiResponse.success(data));
});

router.post('/categories', authenticate, requireAdmin, async (req, res) => {
  const { AssetCategory } = require('../models');
  const data = await AssetCategory.create(req.body);
  res.status(201).json(ApiResponse.created(data, 'Category created successfully'));
});

router.put('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  const { AssetCategory } = require('../models');
  const cat = await AssetCategory.findByPk(req.params.id);
  if (!cat) return res.status(404).json(ApiResponse.error('Category not found', 404));
  await cat.update(req.body);
  res.status(200).json(ApiResponse.success(cat, 'Category updated successfully'));
});

router.delete('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  const { AssetCategory } = require('../models');
  const cat = await AssetCategory.findByPk(req.params.id);
  if (!cat) return res.status(404).json(ApiResponse.error('Category not found', 404));
  cat.isActive = false;
  await cat.save();
  res.status(200).json(ApiResponse.success(null, 'Category deactivated successfully'));
});

// ─── Movements Log ────────────────────────────────────────────────────────────

router.get('/movements/all', authenticate, requireAdmin, async (req, res) => {
  const { AssetMovement, Asset, User } = require('../models');
  const data = await AssetMovement.findAll({
    include: [
      { model: Asset, as: 'asset', attributes: ['id', 'name', 'assetTag', 'assetUniqueId'] },
      { model: User, as: 'movedBy', attributes: ['id', 'firstName', 'lastName'] }
    ],
    order: [['movementDate', 'DESC']],
    limit: 100
  });
  res.status(200).json(ApiResponse.success(data));
});

router.get('/public/passport/:assetTag', async (req, res) => {
  const { assetTag } = req.params;
  const asset = await assetService.findByIdentifier(assetTag);

  if (req.query.scan === 'true') {
    let userId = null;
    let userEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const config = require('../config/env');
        const decoded = jwt.verify(token, config.jwt.secret);
        userId = decoded.id || decoded.userId;
        userEmail = decoded.email;
      } catch (e) {
        // Ignore token decode error
      }
    }
    await assetService.logQrScan(
      asset.id,
      userId,
      userEmail,
      req.ip,
      req.headers['user-agent']
    );
  }

  const { AssetAllocation, MaintenanceRequest, WarrantyTracking, DepreciationRecord, Employee, AssetDocument } = require('../models');

  const [allocations, maintenance, warranty, depreciation, documents, history] = await Promise.all([
    AssetAllocation.findAll({
      where: { assetId: asset.id },
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeCode', 'firstName', 'lastName', 'designation'] }],
      order: [['allocatedDate', 'DESC']],
      limit: 10
    }),
    MaintenanceRequest.findAll({
      where: { assetId: asset.id },
      order: [['startDate', 'DESC']],
      limit: 10
    }),
    WarrantyTracking.findOne({
      where: { assetId: asset.id }
    }),
    DepreciationRecord.findAll({
      where: { assetId: asset.id },
      order: [['financialYear', 'DESC']],
      limit: 10
    }),
    AssetDocument.findAll({
      where: { assetId: asset.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    }),
    assetService.getAssetHistory(asset.id)
  ]);

  res.status(200).json(ApiResponse.success({
    asset,
    allocations,
    maintenance,
    warranty,
    depreciation,
    documents,
    history
  }));
});

router.get('/tag/:assetTag', authenticate, async (req, res) => {
  const data = await assetService.getAssetByTag(req.params.assetTag);
  res.status(200).json(ApiResponse.success(data));
});

router.get('/:id', authenticate, async (req, res) => {
  const asset = await assetService.findByIdentifier(req.params.id);
  
  if (req.query.scan === 'true') {
    await assetService.logQrScan(
      asset.id,
      req.user ? req.user.id : null,
      req.user ? req.user.email : null,
      req.ip,
      req.headers['user-agent']
    );
  }

  res.status(200).json(ApiResponse.success(assetService.toResponse(asset)));
});

router.post('/:id/generate-qr', authenticate, requireAdmin, async (req, res) => {
  const data = await assetService.generateQr(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'QR code generated and emailed to administrator'));
});

router.get('/:assetId/history', authenticate, async (req, res) => {
  const data = await assetService.getAssetHistory(req.params.assetId);
  res.status(200).json(ApiResponse.success(data));
});

router.get('/:assetId/maintenance', authenticate, async (req, res) => {
  const data = await assetService.getAssetMaintenance(req.params.assetId);
  res.status(200).json(ApiResponse.success(data));
});

router.get('/:assetId/documents', authenticate, async (req, res) => {
  const data = await assetService.getAssetDocuments(req.params.assetId);
  res.status(200).json(ApiResponse.success(data));
});

router.post('/:assetId/report-issue', authenticate, async (req, res) => {
  const data = await assetService.reportIssue(req.params.assetId, req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Issue reported and maintenance ticket created'));
});

router.post('/:id/image', authenticate, requireAdmin, uploadImage.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('No image file uploaded', 400));
  }
  const relativeUrl = `uploads/${req.file.filename}`;
  const data = await assetService.updateAssetImage(req.params.id, relativeUrl, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Asset image uploaded successfully'));
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const data = await assetService.updateAsset(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Asset updated successfully'));
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await assetService.deleteAsset(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.noContent('Asset deleted successfully'));
});

router.get('/:id/movements', authenticate, async (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const data = await assetService.getMovementHistory(req.params.id, parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
