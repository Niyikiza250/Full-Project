const { VolunteerRecognition, User, Volunteer } = require('../models');
const { paginated } = require('../utils/response');
const { Op } = require('sequelize');

const listRecognitions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, volunteerId, type } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (volunteerId) where.volunteerId = volunteerId;
    if (type) where.type = type;

    const { count, rows } = await VolunteerRecognition.findAndCountAll({
      where,
      include: [
        { model: User, as: 'volunteer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'awarder', attributes: ['id', 'name'] },
      ],
      order: [['dateAwarded', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const createRecognition = async (req, res, next) => {
  try {
    const data = { ...req.body, awardedBy: req.user.id };
    const recognition = await VolunteerRecognition.create(data);
    await Volunteer.increment('recognitionPoints', {
      by: req.body.points || 10,
      where: { userId: data.volunteerId },
    });
    return res.status(201).json({ success: true, data: recognition, message: 'Recognition awarded' });
  } catch (error) {
    next(error);
  }
};

const deleteRecognition = async (req, res, next) => {
  try {
    const recognition = await VolunteerRecognition.findByPk(req.params.id);
    if (!recognition) return res.status(404).json({ success: false, message: 'Recognition not found' });
    await recognition.destroy();
    return res.json({ success: true, message: 'Recognition deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listRecognitions, createRecognition, deleteRecognition };
