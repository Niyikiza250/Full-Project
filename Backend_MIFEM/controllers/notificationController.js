const { Notification } = require('../models');
const { paginated } = require('../utils/response');

const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    if (read !== undefined) where.read = read === 'true';
    if (type) where.type = type;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    await notif.update({ read: true, readAt: new Date() });
    return res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ read: true, readAt: new Date() }, {
      where: { userId: req.user.id, read: false },
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({ where: { userId: req.user.id, read: false } });
    return res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    await notif.destroy();
    return res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listNotifications, markNotificationRead, markAllRead, getUnreadCount, deleteNotification };
