'use strict';

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const config = require('./src/config/env');
const { connectDatabase } = require('./src/config/database');
const logger = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes        = require('./src/routes/auth');
const assetRoutes       = require('./src/routes/assets');
const allocationRoutes  = require('./src/routes/allocations');
const departmentRoutes  = require('./src/routes/departments');
const employeeRoutes    = require('./src/routes/employees');
const vendorRoutes      = require('./src/routes/vendors');
const maintenanceRoutes = require('./src/routes/maintenance');
const warrantyRoutes    = require('./src/routes/warranty');
const depreciationRoutes = require('./src/routes/depreciation');
const healthRoutes      = require('./src/routes/health');
const dashboardRoutes   = require('./src/routes/dashboard');
const notificationRoutes = require('./src/routes/notifications');
const auditRoutes       = require('./src/routes/auditLogs');
const qrRoutes          = require('./src/routes/qr');
const budgetRoutes      = require('./src/routes/budget');
const reportRoutes      = require('./src/routes/reports');
const aiRoutes          = require('./src/routes/ai');
const ocrRoutes         = require('./src/routes/ocr');
const userRoutes        = require('./src/routes/users');

// ─── Swagger ─────────────────────────────────────────────────────────────────
const { swaggerSpec, swaggerUi } = require('./src/config/swagger');

// ─── App Initialization ───────────────────────────────────────────────────────
const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving QR/uploads
}));

app.use(cors({
  origin: [config.app.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 429, error: 'Too many authentication attempts.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/actuator/health',
  }));
}

// ─── Ensure Upload Directories Exist ─────────────────────────────────────────
[config.app.uploadDir, config.app.qrDir, config.app.avatarDir].forEach((dir) => {
  const resolved = path.resolve(dir);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
    logger.info(`Created directory: ${resolved}`);
  }
});

// ─── Static File Serving (uploads) ───────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(config.app.uploadDir)));

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api/v3/api-docs', (req, res) => res.json(swaggerSpec));

// ─── API Routes (all prefixed with /api) ─────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/assets',        assetRoutes);
app.use('/api/allocations',   allocationRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/employees',     employeeRoutes);
app.use('/api/vendors',       vendorRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/warranty',      warrantyRoutes);
app.use('/api/depreciation',  depreciationRoutes);
app.use('/api/health',        healthRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs',    auditRoutes);
app.use('/api/qr',            qrRoutes);
app.use('/api/budget',        budgetRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/ocr',           ocrRoutes);
app.use('/api/users',          userRoutes);

// ─── Actuator Health Check ───────────────────────────────────────────────────
app.get('/api/actuator/health', (req, res) => {
  res.json({ status: 'UP', service: config.app.name, version: config.app.version });
});

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: `${config.app.name} API`,
    version: config.app.version,
    docs: '/api/swagger-ui',
    health: '/api/actuator/health',
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    // Connect to DB
    await connectDatabase();

    // Start scheduled jobs
    require('./src/scheduler');
    logger.info('Background schedulers started');

    // Start HTTP server
    const PORT = config.PORT || 8080;
    app.listen(PORT, () => {
      logger.info(`${config.app.name} v${config.app.version} started on port ${PORT}`);
      logger.info(`Swagger UI: http://localhost:${PORT}/api/swagger-ui`);
      logger.info(`Health:     http://localhost:${PORT}/api/actuator/health`);
      logger.info(`Env:        ${config.NODE_ENV}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
});

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

module.exports = app;
