const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { transporter } = require('../config/mailer');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Email Service.
 * Uses Nodemailer + Handlebars (replaces Spring Mail + Thymeleaf).
 * All email methods are async — fire-and-forget, non-blocking.
 */

const templatesDir = path.join(__dirname, '../emails/templates');

// ─── Template Loader ─────────────────────────────────────────────────────────

function loadTemplate(name) {
  const filePath = path.join(templatesDir, `${name}.hbs`);
  if (!fs.existsSync(filePath)) {
    logger.warn(`Email template not found: ${filePath}`);
    return null;
  }
  const source = fs.readFileSync(filePath, 'utf-8');
  return Handlebars.compile(source);
}

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"${config.mail.fromName}" <${config.mail.fromAddress}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to: ${to} — Subject: ${subject}`);
  } catch (err) {
    logger.error(`Email sending failed to ${to}: ${err.message}`);
  }
}

// ─── Email Methods ────────────────────────────────────────────────────────────

async function sendPasswordResetEmail(to, firstName, resetToken) {
  const template = loadTemplate('password-reset');
  if (!template) return;

  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
  const html = template({ firstName, resetUrl, appName: config.app.name });
  await sendEmail(to, 'Reset Your Password', html);
}

async function sendAssetAssignmentEmail(to, employeeName, assetName, assetTag) {
  const template = loadTemplate('asset-assignment');
  if (!template) return;
  const html = template({ employeeName, assetName, assetTag, appName: config.app.name });
  await sendEmail(to, `Asset Assigned: ${assetName} (${assetTag})`, html);
}

async function sendWarrantyExpiryEmail(to, recipientName, assetName, assetTag, daysLeft) {
  const template = loadTemplate('warranty-expiry');
  if (!template) return;
  const html = template({ recipientName, assetName, assetTag, daysLeft, appName: config.app.name });
  const urgency = daysLeft <= 7 ? 'URGENT: ' : '';
  await sendEmail(to, `${urgency}Warranty Expiring: ${assetName} (${daysLeft} days)`, html);
}

async function sendMaintenanceCompleteEmail(to, recipientName, assetName, requestNumber) {
  const template = loadTemplate('maintenance-complete');
  if (!template) return;
  const html = template({ recipientName, assetName, requestNumber, appName: config.app.name });
  await sendEmail(to, `Maintenance Completed: ${requestNumber}`, html);
}

async function sendGenericNotificationEmail(to, recipientName, title, message) {
  const template = loadTemplate('generic-notification');
  if (!template) return;
  const html = template({ recipientName, title, message, appName: config.app.name });
  await sendEmail(to, title, html);
}

async function sendQrEmail(to, assetName, assetTag, qrCodePath) {
  try {
    const filename = path.basename(qrCodePath);
    await transporter.sendMail({
      from: `"${config.mail.fromName}" <${config.mail.fromAddress}>`,
      to,
      subject: `QR Code for Asset: ${assetName} (${assetTag})`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">Asset QR Code Generated</h2>
          <p>Hello Administrator,</p>
          <p>Please find attached the generated QR Code for the following asset:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 120px;">Asset Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${assetName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Asset ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-family: monospace;">${assetTag}</td>
            </tr>
          </table>
          <p>The QR code is attached to this email as a PNG file.</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          path: qrCodePath
        }
      ]
    });
    logger.info(`QR Code email sent to: ${to} for asset ${assetTag}`);
  } catch (err) {
    logger.error(`QR Code email sending failed to ${to}: ${err.message}`);
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendAssetAssignmentEmail,
  sendWarrantyExpiryEmail,
  sendMaintenanceCompleteEmail,
  sendGenericNotificationEmail,
  sendQrEmail,
};
