const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listSessions, createSession, getSession, updateSession, closeSession, checkIn, getCheckins, getTrends } = require('../controllers/attendanceController');

router.use(protect);

router.get('/', listSessions);
router.get('/trends', getTrends);
router.get('/:id', getSession);
router.get('/:sessionId/checkins', getCheckins);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('date').notEmpty().withMessage('Date is required'),
  validate,
], createSession);

router.post('/:sessionId/checkin', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  validate,
], checkIn);

router.put('/:id', updateSession);
router.put('/:id/close', closeSession);

module.exports = router;
