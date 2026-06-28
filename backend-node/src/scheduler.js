const cron = require('node-cron');
const logger = require('./utils/logger');

/**
 * Scheduler for background jobs.
 * Uses node-cron for cron-based background jobs.
 * Mirrors:
 *   - warrantyAlertJob
 *   - healthScoreJob
 *   - annualDepreciation
 */

// ─── Warranty Alert Scheduler ─────────────────────────────────────────────────
// Runs daily at 08:00.

cron.schedule('0 8 * * *', async () => {
  logger.info('Running warranty alert scheduler...');
  try {
    const { WarrantyTracking, Asset, Employee, User } = require('./models');
    const notificationService = require('./services/notificationService');
    const emailService = require('./services/emailService');
    const { Op } = require('sequelize');

    const ALERT_DAYS = [90, 60, 30, 15, 7];
    const today = new Date();

    for (const days of ALERT_DAYS) {
      const targetDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      const fromDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
      const toDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

      const expiring = await WarrantyTracking.findAll({
        where: {
          expiryDate: {
            [Op.between]: [
              fromDate.toISOString().split('T')[0],
              toDate.toISOString().split('T')[0],
            ],
          },
        },
        include: [
          {
            model: Asset,
            as: 'asset',
            attributes: ['id', 'name', 'assetTag'],
            include: [
              {
                model: Employee,
                as: 'assignedTo',
                attributes: ['id', 'firstName', 'userId'],
                include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
              },
            ],
          },
        ],
      });

      for (const warranty of expiring) {
        const asset = warranty.asset;
        if (!asset) continue;

        const expiry = new Date(warranty.expiryDate);
        const daysLeft = Math.ceil((expiry - today) / (24 * 60 * 60 * 1000));

        logger.info(`Warranty alert: ${asset.assetTag} expires in ${daysLeft} days`);

        const assignedEmployee = asset.assignedTo;
        if (assignedEmployee?.user) {
          const { email } = assignedEmployee.user;
          const name = assignedEmployee.firstName;

          // Send email notification
          try {
            await emailService.sendWarrantyExpiryEmail(email, name, asset.name, asset.assetTag, daysLeft);
          } catch (emailErr) {
            logger.warn(`Failed to send warranty email to ${email}: ${emailErr.message}`);
          }

          // In-app notification
          try {
            await notificationService.createNotification(
              assignedEmployee.user.id,
              'WARRANTY_EXPIRY',
              `Warranty Expiring: ${asset.name}`,
              `The warranty for asset ${asset.assetTag} expires in ${daysLeft} days.`,
              'ASSET', asset.id, false
            );
          } catch (notifErr) {
            logger.warn(`Failed to create warranty notification: ${notifErr.message}`);
          }
        }
      }
    }

    logger.info('Warranty alert scheduler complete');
  } catch (err) {
    logger.error(`Warranty alert scheduler error: ${err.message}`);
  }
}, {
  timezone: 'Asia/Kolkata', // IST — mirrors zone = "Asia/Kolkata"
});

// ─── Health Score Recalculation ───────────────────────────────────────────────
// Runs daily at 02:00.

cron.schedule('0 2 * * *', async () => {
  logger.info('Running health score recalculation scheduler...');
  try {
    const assetHealthService = require('./services/assetHealthService');
    await assetHealthService.recalculateAll();
    logger.info('Health score recalculation complete');
  } catch (err) {
    logger.error(`Health score scheduler error: ${err.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

// ─── Annual Depreciation Calculation ─────────────────────────────────────────
// Runs annually on April 1 at 03:00 IST (start of Indian financial year)

cron.schedule('0 3 1 4 *', async () => {
  logger.info('Running annual depreciation calculation...');
  try {
    const depreciationService = require('./services/depreciationService');
    const result = await depreciationService.bulkCalculate(null); // no user, system job
    logger.info(`Annual depreciation done. Success: ${result.success}, Failed: ${result.failed}`);
  } catch (err) {
    logger.error(`Annual depreciation scheduler error: ${err.message}`);
  }
}, {
  timezone: 'Asia/Kolkata',
});

logger.info('Scheduled jobs registered: warranty alerts (08:00 IST), health scores (02:00 IST), depreciation (Apr 1, 03:00 IST)');
