const { BlueCard, MissionWord } = require('../models');
const { success, error } = require('../utils/response');

const listBlueCards = async (req, res) => {
  try {
    const cards = await BlueCard.findAll({
      include: [{ model: MissionWord, as: 'missionWords', order: [['sortOrder', 'ASC']] }],
      order: [['createdAt', 'DESC']],
    });
    return success(res, cards);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const getBlueCard = async (req, res) => {
  try {
    const card = await BlueCard.findByPk(req.params.id, {
      include: [{ model: MissionWord, as: 'missionWords', order: [['sortOrder', 'ASC']] }],
    });
    if (!card) return error(res, 'Blue card not found', 404);
    return success(res, card);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const createBlueCard = async (req, res) => {
  try {
    const { congregationLabel, mainTitle, welcomeMessage, missionWordsLabel } = req.body;

    const card = await BlueCard.create({
      congregationLabel, mainTitle, welcomeMessage, missionWordsLabel,
      createdBy: req.user.id,
    });

    return success(res, card, 'Blue card created', 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const updateBlueCard = async (req, res) => {
  try {
    const card = await BlueCard.findByPk(req.params.id);
    if (!card) return error(res, 'Blue card not found', 404);
    const allowedFields = ['congregationLabel', 'mainTitle', 'welcomeMessage', 'missionWordsLabel'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await card.update(updates);
    return success(res, card, 'Blue card updated');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const deleteBlueCard = async (req, res) => {
  try {
    const card = await BlueCard.findByPk(req.params.id);
    if (!card) return error(res, 'Blue card not found', 404);
    await MissionWord.destroy({ where: { cardId: card.id } });
    await card.destroy();
    return success(res, null, 'Blue card deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const saveMissionWords = async (req, res) => {
  try {
    const { id } = req.params;
    const { missionWords } = req.body;

    const card = await BlueCard.findByPk(id);
    if (!card) return error(res, 'Blue card not found', 404);

    await MissionWord.destroy({ where: { cardId: id } });

    if (Array.isArray(missionWords) && missionWords.length > 0) {
      const words = missionWords.map((w, i) => ({
        cardId: id,
        title: w.title || '',
        body: w.body || '',
        sortOrder: i,
      }));
      await MissionWord.bulkCreate(words);
    }

    return success(res, { ok: true }, 'Mission words saved');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { listBlueCards, getBlueCard, createBlueCard, updateBlueCard, deleteBlueCard, saveMissionWords };
