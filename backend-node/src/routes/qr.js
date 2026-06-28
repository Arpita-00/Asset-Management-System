const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { generateQrCode, generateQrDataUrl } = require('../utils/qrCodeGenerator');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');
const config = require('../config/env');
const assetService = require('../services/assetService');
const { ResourceNotFoundError } = require('../middleware/errorHandler');

router.get('/:assetId', async (req, res) => {
  const { assetId } = req.params;
  
  const asset = await assetService.findByIdentifier(assetId);
  const identifier = asset.assetUniqueId || asset.assetTag;
  
  const filePath = path.join(path.resolve(config.app.qrDir), `${identifier}.png`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/png');
    return fs.createReadStream(filePath).pipe(res);
  }

  // Generate on-the-fly
  const qrUrl = await generateQrCode(identifier);
  
  // Save to asset
  const dbAsset = await assetService.findById(asset.id);
  dbAsset.qrCodeUrl = qrUrl;
  await dbAsset.save();

  res.setHeader('Content-Type', 'image/png');
  fs.createReadStream(filePath).pipe(res);
});

router.post('/regenerate/:assetId', authenticate, async (req, res) => {
  const { assetId } = req.params;
  const asset = await assetService.findByIdentifier(assetId);
  
  const data = await assetService.generateQr(asset.id, req.user.id);
  
  res.status(200).json(ApiResponse.success({ qrUrl: data.qrCodeUrl }, 'QR code regenerated'));
});

router.get('/dataurl/:assetId', authenticate, async (req, res) => {
  const { assetId } = req.params;
  const asset = await assetService.findByIdentifier(assetId);
  const identifier = asset.assetUniqueId || asset.assetTag;
  
  const content = `${config.app.frontendUrl}/asset/${identifier}`;
  const dataUrl = await generateQrDataUrl(content);
  res.status(200).json(ApiResponse.success({ dataUrl }));
});

module.exports = router;
