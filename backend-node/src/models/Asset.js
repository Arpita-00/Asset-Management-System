const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Asset model (core entity of the system).
 * Status values: AVAILABLE | ASSIGNED | UNDER_REPAIR | DISPOSED | RETIRED
 */
const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetTag: { type: DataTypes.STRING(50), unique: true, allowNull: false, field: 'assetTag' },
  name: { type: DataTypes.STRING(200), allowNull: false },
  brand: { type: DataTypes.STRING(100) },
  model: { type: DataTypes.STRING(100) },
  serialNumber: { type: DataTypes.STRING(100), unique: true, field: 'serialNumber' },
  purchaseDate: { type: DataTypes.DATEONLY, field: 'purchaseDate' },
  purchaseCost: { type: DataTypes.DECIMAL(15, 2), field: 'purchaseCost' },
  currentValue: { type: DataTypes.DECIMAL(15, 2), field: 'currentValue' },
  currentLocation: { type: DataTypes.STRING(200), field: 'currentLocation' },
  warrantyExpiry: { type: DataTypes.DATEONLY, field: 'warrantyExpiry' },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED', 'RETIRED'),
    defaultValue: 'AVAILABLE',
  },
  description: { type: DataTypes.TEXT },
  specifications: { type: DataTypes.TEXT },
  qrCodeUrl: { type: DataTypes.STRING(500), field: 'qrCodeUrl' },
  assetUniqueId: { type: DataTypes.STRING(100), unique: true, field: 'assetUniqueId' },
  qrGeneratedAt: { type: DataTypes.DATE, field: 'qrGeneratedAt' },
  qrLastUpdated: { type: DataTypes.DATE, field: 'qrLastUpdated' },
  imageUrl: { type: DataTypes.STRING(500), field: 'imageUrl' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
  disposedAt: { type: DataTypes.DATE, field: 'disposedAt' },
  // FKs
  categoryId: { type: DataTypes.BIGINT, field: 'category_id' },
  vendorId: { type: DataTypes.BIGINT, field: 'vendor_id' },
  departmentId: { type: DataTypes.BIGINT, field: 'department_id' },
  assignedToId: { type: DataTypes.BIGINT, field: 'assigned_to_id' },
  createdById: { type: DataTypes.BIGINT, field: 'created_by_id' },
}, {
  tableName: 'assets',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['assetTag'] },
    { unique: true, fields: ['serialNumber'] },
    { fields: ['status'] },
    { fields: ['name'] },
    { fields: ['category_id'] },
    { fields: ['vendor_id'] },
    { fields: ['department_id'] },
    { fields: ['assigned_to_id'] },
  ]
});

module.exports = Asset;
