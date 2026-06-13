const nodemailer = require('nodemailer');
const logger = require('./logger');
const SystemSetting = require('../models/SystemSetting');

let transporterInstance = null;
let lastSmtpConfig = null;

const serializeConfig = (cfg) => JSON.stringify(cfg);

const loadSmtpConfig = async () => {
  try {
    const setting = await SystemSetting.findByPk('smtp');
    if (setting && setting.value && setting.value.host) {
      return setting.value;
    }
  } catch {
    // DB not available, fall through
  }
  return null;
};

const createTransporter = (config) => {
  if (config && config.host) {
    return nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port, 10) || 587,
      secure: config.secure === true || config.secure === 'true',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return null;
};

const getTransporter = async (forceRefresh = false) => {
  const dbConfig = await loadSmtpConfig();
  const configKey = serializeConfig(dbConfig);

  if (forceRefresh || !transporterInstance || configKey !== lastSmtpConfig) {
    const cfg = dbConfig || {
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };

    if (dbConfig) {
      transporterInstance = createTransporter(cfg);
      lastSmtpConfig = configKey;
    } else if (process.env.SMTP_HOST) {
      transporterInstance = createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      });
      lastSmtpConfig = 'env';
    } else {
      const testAccount = await nodemailer.createTestAccount();
      logger.info(`[EMAIL] Using Ethereal test account: ${testAccount.user}`);
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      lastSmtpConfig = 'ethereal';
    }
  }

  return transporterInstance;
};

const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = await getTransporter();
    const fromName = process.env.SMTP_FROM_NAME || 'MIFEM';
    const fromEmail = process.env.SMTP_FROM || 'noreply@mifem.org';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    logger.info(`[EMAIL] Sent to ${to}: "${subject}"`);
    if (info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[EMAIL] Preview URL: ${previewUrl}`);
      }
    }

    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (err) {
    logger.error(`[EMAIL] Failed to send to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

const buildTemplate = (title, content, buttonText, buttonLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a365d;">MIFEM</h1>
      <p style="color: #718096;">Missionary Movement</p>
    </div>
    <div style="background: #f7fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
      <h2 style="color: #2d3748; margin-top: 0;">${title}</h2>
      <p style="color: #4a5568; line-height: 1.6;">${content}</p>
      ${buttonText && buttonLink ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${buttonLink}"
           style="background: #1a56db; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          ${buttonText}
        </a>
      </div>
      <p style="color: #718096; font-size: 14px;">Or copy this link into your browser:</p>
      <p style="color: #4a5568; font-size: 13px; word-break: break-all; background: #edf2f7; padding: 10px; border-radius: 6px;">${buttonLink}</p>
      ` : ''}
    </div>
    <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
      <p>MIFEM &mdash; Seventh-day Adventist Church Management</p>
    </div>
  </div>
`;

const sendVerificationEmail = async (to, token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;

  return sendMail({
    to,
    subject: 'Verify your email address',
    html: buildTemplate(
      'Verify Your Email',
      'Thank you for registering. Please click the button below to verify your email address and activate your account.',
      'Verify Email',
      verifyLink,
    ),
  });
};

const sendPasswordResetEmail = async (to, token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  return sendMail({
    to,
    subject: 'Reset your password',
    html: buildTemplate(
      'Reset Your Password',
      'You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.',
      'Reset Password',
      resetLink,
    ),
  });
};

const testConnection = async (config) => {
  try {
    const transporter = createTransporter(config);
    if (!transporter) return { success: false, error: 'Invalid SMTP configuration' };
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `"MIFEM Test" <${config.from || config.user || 'test@mifem.org'}>`,
      to: config.testEmail || config.user || 'test@mifem.org',
      subject: 'SMTP Configuration Test',
      html: '<p>SMTP configuration is working correctly.</p>',
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, testConnection, sendMail };
