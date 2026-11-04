const { BulletinItem, User } = require('../models');
const { success, error } = require('../utils/response');

const listBulletins = async (req, res) => {
  try {
    const items = await BulletinItem.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']],
    });
    return success(res, items);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { listBulletins };
