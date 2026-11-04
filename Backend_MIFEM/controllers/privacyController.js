const { PrivacyConsent, Member } = require('../models');
const { paginated } = require('../utils/response');

const listConsents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, memberId, consentType } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (memberId) where.memberId = memberId;
    if (consentType) where.consentType = consentType;

    const { count, rows } = await PrivacyConsent.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
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

const getConsent = async (req, res, next) => {
  try {
    const consent = await PrivacyConsent.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });
    if (!consent) return res.status(404).json({ success: false, message: 'Consent not found' });
    return res.json({ success: true, data: consent });
  } catch (error) {
    next(error);
  }
};

const createConsent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.granted) data.grantedAt = new Date();
    const consent = await PrivacyConsent.create(data);
    return res.status(201).json({ success: true, data: consent, message: 'Consent recorded' });
  } catch (error) {
    next(error);
  }
};

const updateConsent = async (req, res, next) => {
  try {
    const consent = await PrivacyConsent.findByPk(req.params.id);
    if (!consent) return res.status(404).json({ success: false, message: 'Consent not found' });
    const data = { ...req.body };
    if (data.granted && !consent.grantedAt) data.grantedAt = new Date();
    await consent.update(data);
    return res.json({ success: true, data: consent, message: 'Consent updated' });
  } catch (error) {
    next(error);
  }
};

const revokeConsent = async (req, res, next) => {
  try {
    const consent = await PrivacyConsent.findByPk(req.params.id);
    if (!consent) return res.status(404).json({ success: false, message: 'Consent not found' });
    await consent.update({ granted: false, revokedAt: new Date() });
    return res.json({ success: true, data: consent, message: 'Consent revoked' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listConsents, getConsent, createConsent, updateConsent, revokeConsent,
};
