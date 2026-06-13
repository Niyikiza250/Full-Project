const { PrayerRequest, CounselingRequest, User, Church } = require('../models');
const { paginated } = require('../utils/response');

const listPrayerRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, prayerType, churchId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (prayerType) where.prayerType = prayerType;
    if (churchId) where.churchId = churchId;
    if (!req.user.role || req.user.role.name !== 'SUPER_ADMIN') {
      if (req.user.churchId) where.churchId = req.user.churchId;
    }

    const { count, rows } = await PrayerRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
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

const getPrayerRequest = async (req, res, next) => {
  try {
    const prayer = await PrayerRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
      ],
    });
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer request not found' });
    return res.json({ success: true, data: prayer });
  } catch (error) {
    next(error);
  }
};

const createPrayerRequest = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const prayer = await PrayerRequest.create(data);
    return res.status(201).json({ success: true, data: prayer, message: 'Prayer request submitted' });
  } catch (error) {
    next(error);
  }
};

const updatePrayerRequest = async (req, res, next) => {
  try {
    const prayer = await PrayerRequest.findByPk(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer request not found' });
    await prayer.update(req.body);
    return res.json({ success: true, data: prayer, message: 'Prayer request updated' });
  } catch (error) {
    next(error);
  }
};

const deletePrayerRequest = async (req, res, next) => {
  try {
    const prayer = await PrayerRequest.findByPk(req.params.id);
    if (!prayer) return res.status(404).json({ success: false, message: 'Prayer request not found' });
    await prayer.destroy();
    return res.json({ success: true, message: 'Prayer request deleted' });
  } catch (error) {
    next(error);
  }
};

const listCounselingRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, counselingType, churchId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (counselingType) where.counselingType = counselingType;
    if (churchId) where.churchId = churchId;
    if (!req.user.role || req.user.role.name !== 'SUPER_ADMIN') {
      if (req.user.churchId) where.churchId = req.user.churchId;
    }

    const { count, rows } = await CounselingRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
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

const getCounselingRequest = async (req, res, next) => {
  try {
    const counseling = await CounselingRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
      ],
    });
    if (!counseling) return res.status(404).json({ success: false, message: 'Counseling request not found' });
    return res.json({ success: true, data: counseling });
  } catch (error) {
    next(error);
  }
};

const createCounselingRequest = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const counseling = await CounselingRequest.create(data);
    return res.status(201).json({ success: true, data: counseling, message: 'Counseling request submitted' });
  } catch (error) {
    next(error);
  }
};

const updateCounselingRequest = async (req, res, next) => {
  try {
    const counseling = await CounselingRequest.findByPk(req.params.id);
    if (!counseling) return res.status(404).json({ success: false, message: 'Counseling request not found' });
    await counseling.update(req.body);
    return res.json({ success: true, data: counseling, message: 'Counseling request updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCounselingRequest = async (req, res, next) => {
  try {
    const counseling = await CounselingRequest.findByPk(req.params.id);
    if (!counseling) return res.status(404).json({ success: false, message: 'Counseling request not found' });
    await counseling.destroy();
    return res.json({ success: true, message: 'Counseling request deleted' });
  } catch (error) {
    next(error);
  }
};

const getPrayerStats = async (req, res, next) => {
  try {
    const total = await PrayerRequest.count();
    const answered = await PrayerRequest.count({ where: { status: 'ANSWERED' } });
    const pending = await PrayerRequest.count({ where: { status: 'PENDING' } });
    const praying = await PrayerRequest.count({ where: { status: 'PRAYING' } });
    return res.json({ success: true, data: { total, answered, pending, praying } });
  } catch (error) {
    next(error);
  }
};

const getCounselingStats = async (req, res, next) => {
  try {
    const total = await CounselingRequest.count();
    const completed = await CounselingRequest.count({ where: { status: 'COMPLETED' } });
    const pending = await CounselingRequest.count({ where: { status: 'PENDING' } });
    const inProgress = await CounselingRequest.count({ where: { status: 'IN_PROGRESS' } });
    return res.json({ success: true, data: { total, completed, pending, inProgress } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPrayerRequests, getPrayerRequest, createPrayerRequest, updatePrayerRequest, deletePrayerRequest,
  listCounselingRequests, getCounselingRequest, createCounselingRequest, updateCounselingRequest, deleteCounselingRequest,
  getPrayerStats, getCounselingStats,
};
