const { VolunteerAvailability, User } = require('../models');

const listAvailability = async (req, res, next) => {
  try {
    const { volunteerId } = req.query;
    const where = {};
    if (volunteerId) where.volunteerId = volunteerId;

    const slots = await VolunteerAvailability.findAll({
      where,
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });
    return res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

const saveAvailability = async (req, res, next) => {
  try {
    const volunteerId = req.body.volunteerId || req.user.id;
    const { slots } = req.body;

    await VolunteerAvailability.destroy({ where: { volunteerId } });

    if (slots && slots.length > 0) {
      const entries = slots.map(s => ({
        volunteerId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: s.isAvailable !== false,
      }));
      await VolunteerAvailability.bulkCreate(entries);
    }

    return res.json({ success: true, message: 'Availability saved' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listAvailability, saveAvailability };
