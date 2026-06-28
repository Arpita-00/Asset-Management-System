const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QrScanLog = sequelize.define('QrScanLog', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, allowNull: false, field: 'asset_id' },
  scannedById: { type: DataTypes.BIGINT, field: 'scanned_by_id', allowNull: true },
  userEmail: { type: DataTypes.STRING(255), field: 'user_email', allowNull: true },
  deviceInfo: { type: DataTypes.STRING(500), field: 'device_info' },
  ipAddress: { type: DataTypes.STRING(50), field: 'ip_address' },
  scannedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'scanned_at' }
}, {
  tableName: 'qr_scan_logs',
  timestamps: false,
});

module.exports = QrScanLog;
