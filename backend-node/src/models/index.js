/**
 * Models index — loads all Sequelize models and defines associations.
 * Defines the application relationships between models.
 */
const { sequelize } = require('../config/database');

// ── Import All Models ─────────────────────────────────────────────────────────
const Role = require('./Role');
const User = require('./User');
const Department = require('./Department');
const Employee = require('./Employee');
const AssetCategory = require('./AssetCategory');
const Vendor = require('./Vendor');
const VendorRating = require('./VendorRating');
const Asset = require('./Asset');
const AssetAllocation = require('./AssetAllocation');
const AssetMovement = require('./AssetMovement');
const AssetHealthScore = require('./AssetHealthScore');
const AssetDocument = require('./AssetDocument');
const MaintenanceRequest = require('./MaintenanceRequest');
const WarrantyTracking = require('./WarrantyTracking');
const DepreciationRecord = require('./DepreciationRecord');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const BudgetForecast = require('./BudgetForecast');
const AiChatHistory = require('./AiChatHistory');
const QrScanLog = require('./QrScanLog');

// ── User ↔ Role (Many-to-Many) ───────────────────────────────────────────────
User.belongsToMany(Role, { through: 'user_roles', foreignKey: 'user_id', otherKey: 'role_id' });
Role.belongsToMany(User, { through: 'user_roles', foreignKey: 'role_id', otherKey: 'user_id' });

// ── User ↔ Department ────────────────────────────────────────────────────────
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });

// ── Employee ↔ Department ────────────────────────────────────────────────────
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });

// ── Employee ↔ User ──────────────────────────────────────────────────────────
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Employee, { foreignKey: 'user_id', as: 'employee' });

// ── Asset ↔ AssetCategory ────────────────────────────────────────────────────
Asset.belongsTo(AssetCategory, { foreignKey: 'category_id', as: 'category' });
AssetCategory.hasMany(Asset, { foreignKey: 'category_id', as: 'assets' });

// ── Asset ↔ Vendor ───────────────────────────────────────────────────────────
Asset.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
Vendor.hasMany(Asset, { foreignKey: 'vendor_id', as: 'assets' });

// ── Asset ↔ Department ───────────────────────────────────────────────────────
Asset.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Asset, { foreignKey: 'department_id', as: 'assets' });

// ── Asset ↔ Employee (assignedTo) ────────────────────────────────────────────
Asset.belongsTo(Employee, { foreignKey: 'assigned_to_id', as: 'assignedTo' });
Employee.hasMany(Asset, { foreignKey: 'assigned_to_id', as: 'assignedAssets' });

// ── Asset ↔ User (createdBy) ─────────────────────────────────────────────────
Asset.belongsTo(User, { foreignKey: 'created_by_id', as: 'createdBy' });

// ── AssetAllocation ──────────────────────────────────────────────────────────
AssetAllocation.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(AssetAllocation, { foreignKey: 'asset_id', as: 'allocations' });

AssetAllocation.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Employee.hasMany(AssetAllocation, { foreignKey: 'employee_id', as: 'allocations' });

AssetAllocation.belongsTo(User, { foreignKey: 'allocated_by_id', as: 'allocatedBy' });
AssetAllocation.belongsTo(User, { foreignKey: 'returned_to_id', as: 'returnedTo' });

// ── AssetMovement ────────────────────────────────────────────────────────────
AssetMovement.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(AssetMovement, { foreignKey: 'asset_id', as: 'movements' });

AssetMovement.belongsTo(User, { foreignKey: 'moved_by_id', as: 'movedBy' });

// ── AssetHealthScore ─────────────────────────────────────────────────────────
AssetHealthScore.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasOne(AssetHealthScore, { foreignKey: 'asset_id', as: 'healthScore' });

// ── AssetDocument ────────────────────────────────────────────────────────────
AssetDocument.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(AssetDocument, { foreignKey: 'asset_id', as: 'documents' });
AssetDocument.belongsTo(User, { foreignKey: 'uploaded_by_id', as: 'uploadedBy' });

// ── MaintenanceRequest ───────────────────────────────────────────────────────
MaintenanceRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(MaintenanceRequest, { foreignKey: 'asset_id', as: 'maintenanceRequests' });

MaintenanceRequest.belongsTo(User, { foreignKey: 'requested_by_id', as: 'requestedBy' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'assigned_to_id', as: 'assignedTo' });

// ── WarrantyTracking ─────────────────────────────────────────────────────────
WarrantyTracking.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasOne(WarrantyTracking, { foreignKey: 'asset_id', as: 'warranty' });

// ── DepreciationRecord ───────────────────────────────────────────────────────
DepreciationRecord.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(DepreciationRecord, { foreignKey: 'asset_id', as: 'depreciationRecords' });
DepreciationRecord.belongsTo(User, { foreignKey: 'calculated_by_id', as: 'calculatedBy' });

// ── Notification ─────────────────────────────────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// ── AuditLog ─────────────────────────────────────────────────────────────────
AuditLog.belongsTo(User, { foreignKey: 'performed_by_id', as: 'performedBy' });

// ── VendorRating ─────────────────────────────────────────────────────────────
VendorRating.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
Vendor.hasMany(VendorRating, { foreignKey: 'vendor_id', as: 'ratings' });
VendorRating.belongsTo(User, { foreignKey: 'rated_by_id', as: 'ratedBy' });

// ── BudgetForecast ────────────────────────────────────────────────────────────
BudgetForecast.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(BudgetForecast, { foreignKey: 'department_id', as: 'budgetForecasts' });

// ── AiChatHistory ─────────────────────────────────────────────────────────────
AiChatHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(AiChatHistory, { foreignKey: 'user_id', as: 'chatHistory' });

// ── QrScanLog ────────────────────────────────────────────────────────────────
QrScanLog.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Asset.hasMany(QrScanLog, { foreignKey: 'asset_id', as: 'scanLogs' });
QrScanLog.belongsTo(User, { foreignKey: 'scanned_by_id', as: 'scannedBy' });

module.exports = {
  sequelize,
  Role, User, Department, Employee,
  AssetCategory, Vendor, VendorRating,
  Asset, AssetAllocation, AssetMovement, AssetHealthScore, AssetDocument,
  MaintenanceRequest, WarrantyTracking, DepreciationRecord,
  Notification, AuditLog, BudgetForecast, AiChatHistory, QrScanLog,
};
