/**
 * Asset Tag Generator.
 * Generates human-readable codes for assets, employees, vendors, maintenance.
 */

const { format } = require('date-fns') || { format: (d, fmt) => {
  // fallback if date-fns not installed
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}${m}`;
}};

function getYYYYMM() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}${m}`;
}

/**
 * Generate asset tag: AST-2026-000001
 */
function generateAssetTag(sequenceId) {
  const seq = String(sequenceId).padStart(6, '0');
  const now = new Date();
  return `AST-${now.getFullYear()}-${seq}`;
}

/**
 * Generate employee code: EMP-00001
 */
function generateEmployeeCode(id) {
  return `EMP-${String(id).padStart(5, '0')}`;
}

/**
 * Generate vendor code: VND-00001
 */
function generateVendorCode(id) {
  return `VND-${String(id).padStart(5, '0')}`;
}

/**
 * Generate maintenance request number: MNT-202406-00001
 */
function generateMaintenanceNumber(sequenceCount) {
  const seq = String(sequenceCount).padStart(5, '0');
  return `MNT-${getYYYYMM()}-${seq}`;
}

/**
 * Generate department code: DEPT-001
 */
function generateDepartmentCode(id) {
  return `DEPT-${String(id).padStart(3, '0')}`;
}

module.exports = {
  generateAssetTag,
  generateEmployeeCode,
  generateVendorCode,
  generateMaintenanceNumber,
  generateDepartmentCode,
};
