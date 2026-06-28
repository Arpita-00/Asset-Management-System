// Application-wide constants

export const ASSET_STATUSES = [
  { value: 'AVAILABLE', label: 'Available', color: 'success' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'info' },
  { value: 'UNDER_REPAIR', label: 'Under Repair', color: 'warning' },
  { value: 'DISPOSED', label: 'Disposed', color: 'danger' },
]

export const HEALTH_LEVELS = [
  { value: 'EXCELLENT', label: 'Excellent', min: 80 },
  { value: 'GOOD', label: 'Good', min: 60 },
  { value: 'AVERAGE', label: 'Average', min: 40 },
  { value: 'POOR', label: 'Poor', min: 20 },
  { value: 'CRITICAL', label: 'Critical', min: 0 },
]

export const RISK_LEVELS = [
  { value: 'LOW', label: 'Low Risk', color: 'success' },
  { value: 'MEDIUM', label: 'Medium Risk', color: 'warning' },
  { value: 'HIGH', label: 'High Risk', color: 'danger' },
]

export const MAINTENANCE_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_PARTS', label: 'Pending Parts' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const MAINTENANCE_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export const USER_ROLES = {
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  ADMIN: 'ROLE_ADMIN',
  EMPLOYEE: 'ROLE_EMPLOYEE',
}

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: [10, 20, 50, 100],
}

export const CHART_COLORS = [
  '#8B0000', '#1A3A6B', '#B8860B', '#1e6b52',
  '#3b5998', '#6B3A2A', '#2E5B4E', '#8B4513',
]

export const WARRANTY_ALERT_DAYS = [90, 60, 30, 15, 7]

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://asset-management-system-2s9o.onrender.com/api'
