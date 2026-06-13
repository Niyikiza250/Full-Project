const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listServiceHours, createServiceHour, updateServiceHour, deleteServiceHour, approveServiceHour, getHoursSummary,
} = require('../controllers/serviceHourController');

const router = express.Router();
router.use(protect);

router.get('/', listServiceHours);
router.get('/summary', getHoursSummary);
router.post('/', [body('hours').isFloat({ min: 0.5 }), body('date').notEmpty(), validate], createServiceHour);
router.put('/:id', updateServiceHour);
router.put('/:id/approve', approveServiceHour);
router.delete('/:id', deleteServiceHour);

module.exports = router;
