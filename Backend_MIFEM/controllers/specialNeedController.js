const { SpecialNeed, Member } = require('../models');
const { paginated } = require('../utils/response');

const listSpecialNeeds = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, memberId, needType, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (memberId) where.memberId = memberId;
    if (needType) where.needType = needType;
    if (status) where.status = status;

    const { count, rows } = await SpecialNeed.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getSpecialNeed = async (req, res, next) => {
  try {
    const need = await SpecialNeed.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });
    if (!need) return res.status(404).json({ success: false, message: 'Special need not found' });
    return res.json({ success: true, data: need });
  } catch (error) {
    next(error);
  }
};

const createSpecialNeed = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const need = await SpecialNeed.create(data);
    return res.status(201).json({ success: true, data: need, message: 'Special need created' });
  } catch (error) {
    next(error);
  }
};

const updateSpecialNeed = async (req, res, next) => {
  try {
    const need = await SpecialNeed.findByPk(req.params.id);
    if (!need) return res.status(404).json({ success: false, message: 'Special need not found' });
    await need.update(req.body);
    return res.json({ success: true, data: need, message: 'Special need updated' });
  } catch (error) {
    next(error);
  }
};

const deleteSpecialNeed = async (req, res, next) => {
  try {
    const need = await SpecialNeed.findByPk(req.params.id);
    if (!need) return res.status(404).json({ success: false, message: 'Special need not found' });
    await need.destroy();
    return res.json({ success: true, message: 'Special need deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSpecialNeeds, getSpecialNeed, createSpecialNeed, updateSpecialNeed, deleteSpecialNeed,
};
