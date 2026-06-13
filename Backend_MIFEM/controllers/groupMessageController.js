const { GroupMessage, User, Church, Ministry } = require('../models');
const { paginated } = require('../utils/response');

const listGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (type) where.type = type;

    const { count, rows } = await GroupMessage.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
        { model: Ministry, as: 'ministry', attributes: ['id', 'name'] },
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

const getGroup = async (req, res, next) => {
  try {
    const group = await GroupMessage.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
        { model: Ministry, as: 'ministry', attributes: ['id', 'name'] },
      ],
    });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    return res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const group = await GroupMessage.create(data);
    return res.status(201).json({ success: true, data: group, message: 'Group created' });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const group = await GroupMessage.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    await group.update(req.body);
    return res.json({ success: true, data: group, message: 'Group updated' });
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const group = await GroupMessage.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    await group.destroy();
    return res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listGroups, getGroup, createGroup, updateGroup, deleteGroup };
