const { ServiceHour, User, Event, Ministry, Volunteer } = require('../models');
const { paginated } = require('../utils/response');
const { Op } = require('sequelize');

const listServiceHours = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, volunteerId, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (volunteerId) where.volunteerId = volunteerId;
    if (status) where.status = status;
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };

    const { count, rows } = await ServiceHour.findAndCountAll({
      where,
      include: [
        { model: User, as: 'volunteer', attributes: ['id', 'name', 'email'] },
        { model: Event, as: 'event', attributes: ['id', 'title'] },
        { model: Ministry, as: 'ministry', attributes: ['id', 'name'] },
      ],
      order: [['date', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const createServiceHour = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.volunteerId) data.volunteerId = req.user.id;
    const entry = await ServiceHour.create(data);
    await updateVolunteerHours(data.volunteerId);
    return res.status(201).json({ success: true, data: entry, message: 'Service hours logged' });
  } catch (error) {
    next(error);
  }
};

const updateServiceHour = async (req, res, next) => {
  try {
    const entry = await ServiceHour.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.update(req.body);
    await updateVolunteerHours(entry.volunteerId);
    return res.json({ success: true, data: entry, message: 'Service hours updated' });
  } catch (error) {
    next(error);
  }
};

const deleteServiceHour = async (req, res, next) => {
  try {
    const entry = await ServiceHour.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    const volunteerId = entry.volunteerId;
    await entry.destroy();
    await updateVolunteerHours(volunteerId);
    return res.json({ success: true, message: 'Service hours deleted' });
  } catch (error) {
    next(error);
  }
};

const approveServiceHour = async (req, res, next) => {
  try {
    const entry = await ServiceHour.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.update({ status: 'APPROVED', approvedBy: req.user.id, approvedAt: new Date() });
    await updateVolunteerHours(entry.volunteerId);
    return res.json({ success: true, data: entry, message: 'Service hours approved' });
  } catch (error) {
    next(error);
  }
};

const getHoursSummary = async (req, res, next) => {
  try {
    const { volunteerId, startDate, endDate } = req.query;
    const where = { status: 'APPROVED' };
    if (volunteerId) where.volunteerId = volunteerId;
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };

    const { ServiceHour: SH } = require('../models');
    const result = await SH.findAll({
      where,
      attributes: [
        [require('sequelize').fn('COALESCE', require('sequelize').fn('SUM', require('sequelize').col('hours')), 0), 'totalHours'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalEntries'],
      ],
      raw: true,
    });
    return res.json({ success: true, data: result[0] || { totalHours: 0, totalEntries: 0 } });
  } catch (error) {
    next(error);
  }
};

const updateVolunteerHours = async (volunteerId) => {
  try {
    const result = await ServiceHour.findAll({
      where: { volunteerId, status: 'APPROVED' },
      attributes: [[require('sequelize').fn('COALESCE', require('sequelize').fn('SUM', require('sequelize').col('hours')), 0), 'total']],
      raw: true,
    });
    await Volunteer.update({ totalServiceHours: result[0]?.total || 0 }, { where: { userId: volunteerId } });
  } catch (err) {
    // silent
  }
};

module.exports = { listServiceHours, createServiceHour, updateServiceHour, deleteServiceHour, approveServiceHour, getHoursSummary };
