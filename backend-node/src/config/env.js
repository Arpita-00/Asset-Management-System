/**
 * Environment configuration.
 * All values come from process.env with sensible defaults.
 */
require('dotenv').config();

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

const hasMysqlEnv = Boolean(
  process.env.MYSQL_HOST
  || process.env.MYSQL_PORT
  || process.env.MYSQL_DATABASE
  || process.env.MYSQL_USER
  || process.env.MYSQL_PASSWORD
);

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.SERVER_PORT || '8080', 10),

  // Database
  db: {
    host: process.env.MYSQL_HOST || (hasMysqlEnv ? 'db' : firstDefined(process.env.DB_HOST, 'localhost')),
    port: parseInt(firstDefined(process.env.MYSQL_PORT, process.env.DB_PORT) || '3306', 10),
    name: hasMysqlEnv
      ? (firstDefined(process.env.MYSQL_DATABASE, process.env.DB_NAME) || 'asset_management_db')
      : (firstDefined(process.env.DB_NAME, process.env.MYSQL_DATABASE) || 'asset_management_db'),
    username: hasMysqlEnv
      ? (firstDefined(process.env.MYSQL_USER, process.env.DB_USERNAME, process.env.DB_USER) || 'root')
      : (firstDefined(process.env.DB_USERNAME, process.env.DB_USER, process.env.MYSQL_USER) || 'root'),
    password: hasMysqlEnv
      ? (process.env.MYSQL_PASSWORD ?? process.env.DB_PASSWORD ?? 'root')
      : (process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? 'root'),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      acquire: 30000,
      idle: 600000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970',
    accessExpiry: parseInt(process.env.JWT_ACCESS_EXPIRY || '86400000', 10),   // 24h in ms
    refreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY || '604800000', 10), // 7d in ms
  },

  // AES-256-GCM Encryption (32-byte key as 64-char hex string)
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
  },

  // Application
  app: {
    name: 'AI-Powered Smart Asset Management System',
    version: '1.0.0',
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:8080',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    qrDir: process.env.QR_DIR || './uploads/qr',
    avatarDir: process.env.AVATAR_DIR || './uploads/avatars',
  },

  // Email
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    username: process.env.MAIL_USERNAME || '',
    password: process.env.MAIL_PASSWORD || '',
    fromName: process.env.MAIL_FROM_NAME || 'Asset Management System',
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'noreply@assetms.com',
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  },

  // Pagination
  pagination: {
    defaultPage: parseInt(process.env.DEFAULT_PAGE || '0', 10),
    defaultSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
};
