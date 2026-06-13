const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent, approveEvent, saveTimeline, listRegistrations, registerAttendance } = require('../controllers/eventController');

router.use(protect);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.get('/:id/registrations', listRegistrations);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  validate,
], createEvent);

router.post('/:id/attendance', [
  body('memberId').notEmpty().withMessage('Member ID is required'),
  validate,
], registerAttendance);

router.put('/:id', updateEvent);
router.put('/:id/approve', authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), approveEvent);
router.put('/:id/timeline', saveTimeline);
router.delete('/:id', deleteEvent);

module.exports = router;
