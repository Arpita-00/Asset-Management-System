const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const logger = require('./logger');

/**
 * QR Code Generator.
 * Generates QR codes as PNG files and returns their URL path.
 */

/**
 * Generate a QR code PNG for an asset tag.
 * Saves to uploads/qr/<assetTag>.png and returns the URL path.
 *
 * @param {string} assetTag - e.g. "AST-202406-00001"
 * @returns {string} URL path to QR image e.g. "/uploads/qr/AST-202406-00001.png"
 */
async function generateQrCode(assetTag) {
  const qrDir = path.resolve(config.app.qrDir);
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  const filename = `${assetTag}.png`;
  const filePath = path.join(qrDir, filename);

  // QR content — points to secure asset details scan URL
  const qrContent = `${config.app.frontendUrl}/asset/${assetTag}`;

  await QRCode.toFile(filePath, qrContent, {
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#1e293b',  // slate-800
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  logger.debug(`QR code generated: ${filePath}`);
  return `/uploads/qr/${filename}`;
}

/**
 * Generate a QR code as a Buffer (for embedding in PDFs).
 */
async function generateQrBuffer(content) {
  return QRCode.toBuffer(content, {
    type: 'png',
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate a QR code as a data URL (base64).
 */
async function generateQrDataUrl(content) {
  return QRCode.toDataURL(content, {
    type: 'image/png',
    width: 300,
    errorCorrectionLevel: 'H',
  });
}

module.exports = { generateQrCode, generateQrBuffer, generateQrDataUrl };
