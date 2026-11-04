const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  listDocuments, getDocument, createDocument, updateDocument, deleteDocument,
} = require('../controllers/documentController');

const MANAGE_DOCUMENT_ROLES = [
  'SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR',
  'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER',
];

const router = express.Router();
router.use(protect);

router.get('/', listDocuments);
router.get('/:id', getDocument);
router.post('/', authorize(...MANAGE_DOCUMENT_ROLES), [body('title').notEmpty(), validate], createDocument);
router.put('/:id', authorize(...MANAGE_DOCUMENT_ROLES), updateDocument);
router.delete('/:id', authorize(...MANAGE_DOCUMENT_ROLES), deleteDocument);

module.exports = router;
