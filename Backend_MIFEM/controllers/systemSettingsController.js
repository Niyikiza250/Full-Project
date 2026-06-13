const SystemSetting = require('../models/SystemSetting');
const { success, error } = require('../utils/response');
const { testConnection } = require('../utils/email');

const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await SystemSetting.findByPk(key);
    return success(res, { key, value: setting ? setting.value : null });
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const saveSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return error(res, 'Value is required', 400);

    await SystemSetting.upsert({ key, value });
    return success(res, { key, value }, 'Setting saved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getLanguage = async (req, res) => {
  try {
    const setting = await SystemSetting.findByPk('language');
    return success(res, { language: setting ? setting.value : 'en' });
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const saveLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!language || !['en', 'rw'].includes(language)) {
      return error(res, 'Invalid language value. Must be "en" or "rw"', 400);
    }

    await SystemSetting.upsert({ key: 'language', value: language });
    return success(res, { ok: true }, 'Language saved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const listSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    return success(res, settings);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const testSmtp = async (req, res) => {
  try {
    const { host, port, secure, user, pass, testEmail } = req.body;
    if (!host || !port || !user || !pass) {
      return error(res, 'Host, port, user, and pass are required', 400);
    }
    const result = await testConnection({ host, port, secure, user, pass, testEmail: testEmail || user });
    if (result.success) {
      return success(res, result, 'SMTP connection successful. Test email sent.');
    }
    return error(res, 'SMTP test failed', 400, result.error);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { getSetting, saveSetting, getLanguage, saveLanguage, listSettings, testSmtp };
