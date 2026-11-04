const { Op } = require('sequelize');
const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');
const { success, error } = require('../utils/response');

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

    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return error(res, 'Invalid dataUrl format', 400);
    }

    const sanitizedId = path.basename(id).replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const filename = `${sanitizedId}.${ext}`;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicPath = `/uploads/${filename}`;
    return success(res, { path: publicPath }, 'Image uploaded');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { listAchievements, saveAchievement, deleteAchievement, uploadAchievementImage };
