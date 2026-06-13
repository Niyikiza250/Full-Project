const { Announcement, AnnouncementRead, User } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.senderId) where.senderId = req.query.senderId;

    // Role-based filtering
    const user = req.user;
    if (user) {
      const roleName = user.role ? user.role.name : null;
      where[Op.or] = [
        { targetRole: null },
        { targetRole: roleName },
      ];
    }

    const { rows, count } = await Announcement.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List announcements error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return error(res, 'Announcement not found', 404);
    return success(res, announcement);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, body, priority, category, publishedAt, scheduledAt, targetRole, targetId, unionId, fieldId, districtId, churchId, ministryId } = req.body;

    if (!title || !body) return error(res, 'Title and body are required', 400);

    const announcement = await Announcement.create({
      title, body, priority, category, publishedAt, scheduledAt,
      targetRole, targetId, unionId, fieldId, districtId, churchId, ministryId,
      senderId: req.user.id,
      author: req.user.name,
      authorRole: req.user.role ? req.user.role.name : null,
    });

    return success(res, announcement, 'Announcement created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return error(res, 'Announcement not found', 404);
    const allowedFields = ['title', 'body', 'priority', 'category', 'publishedAt', 'scheduledAt', 'targetRole', 'targetId', 'unionId', 'fieldId', 'districtId', 'churchId', 'ministryId'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await announcement.update(updates);
    return success(res, announcement, 'Announcement updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return error(res, 'Announcement not found', 404);
    await announcement.destroy();
    return success(res, null, 'Announcement deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [record, created] = await AnnouncementRead.findOrCreate({
      where: { announcementId: id, userId: req.user.id },
      defaults: { readAt: new Date() },
    });
    return success(res, record, created ? 'Marked as read' : 'Already read');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getReadStatus = async (req, res) => {
  try {
    const reads = await AnnouncementRead.findAll({
      where: { announcementId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    return success(res, reads);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, markAsRead, getReadStatus };
