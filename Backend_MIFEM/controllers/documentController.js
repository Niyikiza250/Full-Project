const { Document, User, Church, Ministry } = require('../models');
const { paginated } = require('../utils/response');

const listDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, status, churchId, ministryId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (churchId) where.churchId = churchId;
    if (ministryId) where.ministryId = ministryId;

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
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

const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
      ],
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    return res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const createDocument = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const doc = await Document.create(data);
    return res.status(201).json({ success: true, data: doc, message: 'Document uploaded' });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await doc.update(req.body);
    return res.json({ success: true, data: doc, message: 'Document updated' });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await doc.destroy();
    return res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listDocuments, getDocument, createDocument, updateDocument, deleteDocument };
