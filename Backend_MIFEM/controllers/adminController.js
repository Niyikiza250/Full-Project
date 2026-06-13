const { AuditLog, AdminActivityLog, User } = require('../models');
const { success, error } = require('../utils/response');

const listAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'actorUser', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    return success(res, logs);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const listAdminActivity = async (req, res) => {
  try {
    const logs = await AdminActivityLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    return success(res, logs);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listAuditLogs, listAdminActivity };
