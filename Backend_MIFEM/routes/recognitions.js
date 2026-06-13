const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listRecognitions, createRecognition, deleteRecognition } = require('../controllers/recognitionController');

const router = express.Router();
router.use(protect);

router.get('/', listRecognitions);
router.post('/', [body('volunteerId').notEmpty(), body('title').notEmpty(), validate], createRecognition);
router.delete('/:id', deleteRecognition);

module.exports = router;
