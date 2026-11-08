const { Op } = require('sequelize');
const HeroSlide = require('../models/HeroSlide');
const { EmailSubscription } = require('../models');
const { success, error } = require('../utils/response');
const { sendMail, buildTemplate } = require('../utils/email');
const logger = require('../utils/logger');
const { isValidImageDataUrl } = require('../utils/imageDataUrl');

const notifySubscribers = async (slides) => {
  try {
    const subscriptions = await EmailSubscription.findAll({ where: { isActive: true } });
    if (subscriptions.length === 0) return;

    const titles = slides.map((s) => s.title).filter(Boolean).slice(0, 3);
    const content =
      titles.length > 0
        ? `We have just posted new updates on the MIFEM homepage:<br/><br/>${titles
            .map((t) => `&bull; ${t}`)
            .join('<br/>')}`
        : 'We have just posted new updates on the MIFEM homepage.';

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    for (const sub of subscriptions) {
      await sendMail({
        to: sub.email,
        subject: 'New Update on the MIFEM Homepage',
        html: buildTemplate(
          'New Update on the MIFEM Homepage',
          content,
          'View Updates',
          `${baseUrl}/`,
        ),
      });
    }

    logger.info(`[HERO] Notified ${subscriptions.length} subscribers about hero update`);
  } catch (err) {
    logger.error(`[HERO] Failed to notify subscribers: ${err.message}`);
  }
};

const listSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.findAll({ order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']] });
    return success(res, slides);
  } catch (err) {
    logger.error(`[HERO] Failed to load slides: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const batchSaveSlides = async (req, res) => {
  try {
    const body = req.body;
    const slidesData = Array.isArray(body) ? body : (body.slides || []);

    const incomingIds = slidesData.map(s => s.id).filter(Boolean);

    for (let i = 0; i < slidesData.length; i++) {
      await HeroSlide.upsert({ ...slidesData[i], sortOrder: i });
    }

    if (incomingIds.length > 0) {
      await HeroSlide.destroy({ where: { id: { [Op.notIn]: incomingIds } } });
    }

    await notifySubscribers(slidesData);

    return success(res, { ok: true }, 'Slides saved');
  } catch (err) {
    logger.error(`[HERO] Failed to save slides: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const uploadSlideImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { dataUrl } = req.body;

    if (!dataUrl) return error(res, 'dataUrl is required', 400);
    if (!isValidImageDataUrl(dataUrl)) {
      return error(res, 'A valid image data URL under 5MB is required', 400);
    }

    return success(res, { path: dataUrl }, 'Image ready to save');
  } catch (err) {
    logger.error(`[HERO] Failed to process slide image ${req.params.id}: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

module.exports = { listSlides, batchSaveSlides, uploadSlideImage };
