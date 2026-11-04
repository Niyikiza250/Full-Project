const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listSessions, createSession, getSession, updateSession, closeSession, checkIn, getCheckins, getTrends } = require('../controllers/attendanceController');

const MANAGE_ATTENDANCE_ROLES = [
  'SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR',
  'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER',
];

router.use(protect);

router.get('/', listSessions);
router.get('/trends', getTrends);
router.get('/:id', getSession);
router.get('/:sessionId/checkins', getCheckins);

router.post('/', authorize(...MANAGE_ATTENDANCE_ROLES), [
  body('name').notEmpty().withMessage('Name is required'),
  body('date').notEmpty().withMessage('Date is required'),
  validate,
], createSession);

router.post('/:sessionId/checkin', authorize(...MANAGE_ATTENDANCE_ROLES), [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  validate,
], checkIn);

router.put('/:id', authorize(...MANAGE_ATTENDANCE_ROLES), updateSession);
router.put('/:id/close', authorize(...MANAGE_ATTENDANCE_ROLES), closeSession);

module.exports = router;
