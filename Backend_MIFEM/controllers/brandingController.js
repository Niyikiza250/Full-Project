const SystemSetting = require('../models/SystemSetting');
const { success, error } = require('../utils/response');
const { isValidImageDataUrl } = require('../utils/imageDataUrl');
const logger = require('../utils/logger');

const ASSET_KEYS = {
  logo: 'brand_logo',
  adventistLogo: 'brand_adventist_logo',
  favicon: 'brand_favicon',
};

const ASSET_NAMES = Object.keys(ASSET_KEYS);

const readBranding = async () => {
  const rows = await SystemSetting.findAll({
    where: { key: Object.values(ASSET_KEYS) },
  });
  const values = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return ASSET_NAMES.reduce((acc, asset) => {
    acc[asset] = values[ASSET_KEYS[asset]] || null;
    return acc;
  }, {});
};

const getBranding = async (req, res) => {
  try {
    const branding = await readBranding();
    return success(res, branding);
  } catch (err) {
    logger.error(`[BRANDING] Failed to load assets: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const saveBrandAsset = async (req, res) => {
  try {
    const { asset } = req.params;
    const key = ASSET_KEYS[asset];
    if (!key) return error(res, 'Unknown brand asset', 400);

    const { value } = req.body;
    if (!isValidImageDataUrl(value)) {
      return error(res, 'A valid image data URL under 5MB is required', 400);
    }

    await SystemSetting.upsert({ key, value });
    return success(res, { asset, value }, 'Brand asset saved');
  } catch (err) {
    logger.error(`[BRANDING] Failed to save asset: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const resetBrandAsset = async (req, res) => {
  try {
    const { asset } = req.params;
    const key = ASSET_KEYS[asset];
    if (!key) return error(res, 'Unknown brand asset', 400);

    await SystemSetting.destroy({ where: { key } });
    return success(res, { asset }, 'Brand asset reset');
  } catch (err) {
    logger.error(`[BRANDING] Failed to reset asset: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getBranding, saveBrandAsset, resetBrandAsset };
