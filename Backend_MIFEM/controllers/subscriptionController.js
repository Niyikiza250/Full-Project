const { EmailSubscription } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const [subscription, created] = await EmailSubscription.findOrCreate({
      where: { email },
      defaults: { email, isActive: true },
    });

    if (!created && !subscription.isActive) {
      await subscription.update({ isActive: true });
    }

    return success(res, { email }, created ? 'Subscribed successfully' : 'Already subscribed', 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return success(res, { email: req.body.email }, 'Already subscribed');
    }
    logger.error(`Subscription error: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const subscription = await EmailSubscription.findOne({ where: { email } });
    if (!subscription) return error(res, 'Subscription not found', 404);

    await subscription.update({ isActive: false });
    return success(res, null, 'Unsubscribed successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const listSubscriptions = async (req, res) => {
  try {
    const subscriptions = await EmailSubscription.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
    return success(res, subscriptions);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { subscribe, unsubscribe, listSubscriptions };
