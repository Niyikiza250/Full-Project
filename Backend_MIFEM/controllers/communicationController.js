const { InternalMessage, SmsTemplate } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        { senderId: req.user.id },
        { recipientId: req.user.id },
      ],
    };

    const { rows, count } = await InternalMessage.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recipientId, recipientName, toName, subject, body, preview } = req.body;
    const actualRecipientId = recipientId || null;
    const actualRecipientName = recipientName || toName || '';
    const actualBody = body || preview || '';
    if (!actualRecipientName || !subject || !actualBody) {
      return error(res, 'Recipient, subject, and body are required', 400);
    }

    const message = await InternalMessage.create({
      senderId: req.user.id,
      senderName: req.user.name,
      recipientId: actualRecipientId,
      recipientName: actualRecipientName,
      subject,
      body: actualBody,
    });

    return success(res, message, 'Message sent', 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const markMessageRead = async (req, res) => {
  try {
    const message = await InternalMessage.findByPk(req.params.id);
    if (!message) return error(res, 'Message not found', 404);

    await message.update({ read: true, readAt: new Date() });
    return success(res, message, 'Message marked as read');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const listSmsTemplates = async (req, res) => {
  try {
    const templates = await SmsTemplate.findAll({ order: [['name', 'ASC']] });
    return success(res, templates);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const createSmsTemplate = async (req, res) => {
  try {
    const { name, body } = req.body;
    if (!name || !body) return error(res, 'Name and body are required', 400);

    const template = await SmsTemplate.create({ name, body, createdBy: req.user.id });
    return success(res, template, 'Template created', 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const updateSmsTemplate = async (req, res) => {
  try {
    const template = await SmsTemplate.findByPk(req.params.id);
    if (!template) return error(res, 'Template not found', 404);
    const allowedFields = ['name', 'body'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await template.update(updates);
    return success(res, template, 'Template updated');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const deleteSmsTemplate = async (req, res) => {
  try {
    const template = await SmsTemplate.findByPk(req.params.id);
    if (!template) return error(res, 'Template not found', 404);
    await template.destroy();
    return success(res, null, 'Template deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { listMessages, sendMessage, markMessageRead, listSmsTemplates, createSmsTemplate, updateSmsTemplate, deleteSmsTemplate };
