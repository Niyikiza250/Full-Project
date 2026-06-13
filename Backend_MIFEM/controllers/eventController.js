const { Event, EventTimeline, EventRegistration, Member, AuditLog } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { category, status, churchId, fieldId, search } = req.query;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (churchId) where.churchId = churchId;
    if (fieldId) where.fieldId = fieldId;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await Event.findAndCountAll({
      where,
      offset,
      limit,
      order: [['startDate', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List events error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: EventTimeline, as: 'timeline', order: [['sortOrder', 'ASC']] },
        { model: EventRegistration, as: 'registrations' },
      ],
    });
    if (!event) return error(res, 'Event not found', 404);
    return success(res, event);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, category, status, startDate, endDate, location, organizer, maxAttendees, imageUrl, churchId, fieldId } = req.body;
    if (!title || !startDate || !endDate) return error(res, 'Title, start date, and end date are required', 400);

    const event = await Event.create({
      title, description, category, status: status || 'DRAFT',
      startDate, endDate, location, organizer, maxAttendees, imageUrl,
      churchId, fieldId, createdBy: req.user.id,
    });

    return success(res, event, 'Event created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return error(res, 'Event not found', 404);

    const allowedFields = ['title', 'description', 'category', 'status', 'startDate', 'endDate', 'location', 'organizer', 'maxAttendees', 'imageUrl', 'churchId', 'fieldId'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await event.update(updates);
    return success(res, event, 'Event updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return error(res, 'Event not found', 404);
    await event.destroy();
    return success(res, null, 'Event deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return error(res, 'Event not found', 404);
    if (event.status === 'CANCELLED') return error(res, 'Cannot approve a cancelled event', 400);
    if (event.status === 'COMPLETED') return error(res, 'Event already completed', 400);

    await event.update({ status: 'UPCOMING' });

    await AuditLog.create({
      actor: req.user.id,
      action: 'EVENT_APPROVED',
      target: event.id,
      targetType: 'Event',
      metadata: { title: event.title },
    });

    return success(res, event, 'Event approved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const saveTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeline } = req.body;
    if (!Array.isArray(timeline)) return error(res, 'Timeline array is required', 400);

    await EventTimeline.destroy({ where: { eventId: id } });
    if (timeline.length > 0) {
      const entries = timeline.map((t, i) => ({ ...t, eventId: id, sortOrder: i }));
      await EventTimeline.bulkCreate(entries);
    }
    return success(res, null, 'Timeline saved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const listRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.findAll({
      where: { eventId: req.params.id },
      include: [{ model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }],
    });
    return success(res, registrations);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const registerAttendance = async (req, res) => {
  try {
    const { memberId, memberName, status } = req.body;
    const event = await Event.findByPk(req.params.id);
    if (!event) return error(res, 'Event not found', 404);

    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return error(res, 'Event has reached maximum capacity', 400);
    }

    const registration = await EventRegistration.create({
      eventId: req.params.id, memberId, memberName,
      status: status || 'REGISTERED',
    });

    await event.increment('currentAttendees');
    return success(res, registration, 'Registered', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, approveEvent, saveTimeline, listRegistrations, registerAttendance };
