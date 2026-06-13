const { Op } = require('sequelize');
const HeroSlide = require('../models/HeroSlide');
const fs = require('fs');
const path = require('path');
const { success, error } = require('../utils/response');

const listSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.findAll({ order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']] });
    return success(res, slides);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const batchSaveSlides = async (req, res) => {
  try {
    const body = req.body;
    const slidesData = Array.isArray(body) ? body : (body.slides || []);

    const incomingIds = slidesData.map(s => s.id).filter(Boolean);

    for (const slide of slidesData) {
      await HeroSlide.upsert(slide);
    }

    if (incomingIds.length > 0) {
      await HeroSlide.destroy({ where: { id: { [Op.notIn]: incomingIds } } });
    }

    return success(res, { ok: true }, 'Slides saved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const uploadSlideImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataUrl } = req.body;

    if (!dataUrl) return error(res, 'dataUrl is required', 400);

    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return error(res, 'Invalid dataUrl format', 400);

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const sanitizedId = path.basename(id).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${sanitizedId}.${ext}`;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    fs.mkdirSync(path.join(__dirname, '..', 'uploads'), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    return success(res, { path: `/uploads/${filename}` }, 'Image uploaded');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listSlides, batchSaveSlides, uploadSlideImage };
