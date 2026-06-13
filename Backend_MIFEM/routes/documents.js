const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listDocuments, getDocument, createDocument, updateDocument, deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();
router.use(protect);

router.get('/', listDocuments);
router.get('/:id', getDocument);
router.post('/', [body('title').notEmpty(), validate], createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
