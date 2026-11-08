const { Op } = require('sequelize');
const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');
const { success, error } = require('../utils/response');
const { isValidImageDataUrl } = require('../utils/imageDataUrl');
const logger = require('../utils/logger');

const listAchievements = async (req, res) => {
  try {
    const where = {};
    if (req.query.kind) where.kind = req.query.kind;
    if (req.query.status) where.status = req.query.status;

    const achievements = await Achievement.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    return success(res, achievements);
  } catch (err) {
    logger.error(`[ACHIEVEMENT] Failed to load achievements: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const saveAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await Achievement.findByPk(id);
    if (existing) {
      await existing.update(data);
    } else {
      await Achievement.create({ ...data, id });
    }

    return success(res, { ok: true }, 'Achievement saved');
  } catch (err) {
    logger.error(`[ACHIEVEMENT] Failed to save ${req.params.id}: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findByPk(id);

    if (achievement && achievement.coverUrl && achievement.coverUrl.startsWith('/uploads/')) {
      const safePath = path.normalize(achievement.coverUrl).replace(/^(\.\.(\/|\\))+/, '');
      const imagePath = path.join(__dirname, '..', safePath);
      if (imagePath.startsWith(path.join(__dirname, '..', 'uploads'))) {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await Achievement.destroy({ where: { id } });
    return success(res, { ok: true }, 'Achievement deleted');
  } catch (err) {
    logger.error(`[ACHIEVEMENT] Failed to delete ${req.params.id}: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const uploadAchievementImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataUrl } = req.body;

    if (!dataUrl) {
      return error(res, 'dataUrl is required', 400);
    }
    if (!isValidImageDataUrl(dataUrl)) {
      return error(res, 'A valid image data URL under 5MB is required', 400);
    }

    return success(res, { path: dataUrl }, 'Image ready to save');
  } catch (err) {
    logger.error(`[ACHIEVEMENT] Failed to process image ${req.params.id}: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

module.exports = { listAchievements, saveAchievement, deleteAchievement, uploadAchievementImage };
