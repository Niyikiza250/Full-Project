const { AttendanceSession, AttendanceCheckin, Member } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.churchId) where.churchId = req.query.churchId;

    const { rows, count } = await AttendanceSession.findAndCountAll({
      where,
      offset,
      limit,
      order: [['date', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createSession = async (req, res) => {
  try {
    const { name, date, venue, expected, churchId, fieldId } = req.body;
    if (!name || !date) return error(res, 'Name and date are required', 400);

    const session = await AttendanceSession.create({
      name, date, venue, expected: expected || 0,
      churchId, fieldId, createdBy: req.user.id,
      status: 'OPEN',
    });

    return success(res, session, 'Session created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findByPk(req.params.id, {
      include: [{ model: AttendanceCheckin, as: 'checkins', order: [['checkedInAt', 'DESC']] }],
    });
    if (!session) return error(res, 'Session not found', 404);
    return success(res, session);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findByPk(req.params.id);
    if (!session) return error(res, 'Session not found', 404);
    await session.update(req.body);
    return success(res, session, 'Session updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const closeSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findByPk(req.params.id);
    if (!session) return error(res, 'Session not found', 404);

    const checkinCount = await AttendanceCheckin.count({ where: { sessionId: session.id } });
    await session.update({ status: 'CLOSED', present: checkinCount });

    return success(res, session, 'Session closed');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const checkIn = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { memberId, memberName, method } = req.body;
    if (!sessionId || (!memberId && !memberName)) {
      return error(res, 'Session ID and memberId or memberName are required', 400);
    }

    const session = await AttendanceSession.findByPk(sessionId);
    if (!session) return error(res, 'Session not found', 404);
    if (session.status !== 'OPEN') return error(res, 'Session is closed', 400);

    const existing = await AttendanceCheckin.findOne({ where: { sessionId, memberId: memberId || '' } });
    if (existing) return error(res, 'Already checked in', 400);

    const checkin = await AttendanceCheckin.create({
      sessionId, memberId, memberName: memberName || '',
      method: method || 'MANUAL',
    });

    const count = await AttendanceCheckin.count({ where: { sessionId } });
    await session.update({ present: count });

    return success(res, checkin, 'Checked in', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getCheckins = async (req, res) => {
  try {
    const checkins = await AttendanceCheckin.findAll({
      where: { sessionId: req.params.sessionId },
      order: [['checkedInAt', 'DESC']],
    });
    return success(res, checkins);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getTrends = async (req, res) => {
  try {
    const { period, fieldId } = req.query;
    const dateFilter = {};
    if (period === 'WEEKLY') {
      dateFilter.date = { [Op.gte]: new Date(Date.now() - 7 * 86400000) };
    } else if (period === 'MONTHLY') {
      dateFilter.date = { [Op.gte]: new Date(Date.now() - 30 * 86400000) };
    }

    const where = { ...dateFilter };
    if (fieldId) where.fieldId = fieldId;

    const sessions = await AttendanceSession.findAll({ where, order: [['date', 'ASC']] });
    return success(res, sessions);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listSessions, createSession, getSession, updateSession, closeSession, checkIn, getCheckins, getTrends };
