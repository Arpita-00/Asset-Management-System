const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  config.db.name,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    pool: config.db.pool,
    logging: config.NODE_ENV === 'development'
      ? (msg) => logger.debug(msg)
      : false,
    define: {
      underscored: false,
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    },
    timezone: '+00:00',
  }
);

/**
 * Test and authenticate the database connection.
 */
async function connectDatabase() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info(`✅ Database connected: ${config.db.host}:${config.db.port}/${config.db.name}`);

    const models = require('../models');
    await sequelize.sync();
    logger.info('✅ Database tables synchronized');

    await seedDefaultAuthData(models);

    const { seedEnterpriseData } = require('./seeder');
    await seedEnterpriseData();

    return sequelize;
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
  });

  const databaseName = config.db.name.replace(/`/g, '``');
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();
}

async function seedDefaultAuthData(models) {
  const { User, Role } = models;

  const roleDefinitions = [
    'ROLE_SUPER_ADMIN',
    'ROLE_ADMIN',
    'ROLE_EMPLOYEE',
  ];

  const roles = {};
  for (const roleName of roleDefinitions) {
    const [role] = await Role.findOrCreate({ where: { name: roleName }, defaults: { name: roleName } });
    roles[roleName] = role;
  }

  const demoUsers = [
    {
      firstName: 'Demo',
      lastName: 'Admin',
      email: 'admin@company.com',
      password: 'Admin@123',
      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'],
    },
    {
      firstName: 'Demo',
      lastName: 'Employee',
      email: 'employee@company.com',
      password: 'Emp@123',
      roles: ['ROLE_EMPLOYEE'],
    },
  ];

  for (const demoUser of demoUsers) {
    const [user, created] = await User.findOrCreate({
      where: { email: demoUser.email },
      defaults: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        email: demoUser.email,
        password: await bcrypt.hash(demoUser.password, 10),
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!created) {
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      await user.update({
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        password: hashedPassword,
        isActive: true,
        isEmailVerified: true,
      });
    }

    for (const roleName of demoUser.roles) {
      await user.addRole(roles[roleName]);
    }
  }

  logger.info('✅ Default demo users seeded: admin@company.com, employee@company.com');
}

module.exports = { sequelize, connectDatabase };
