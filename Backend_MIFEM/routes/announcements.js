const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, markAsRead, getReadStatus } = require('../controllers/announcementController');

const MANAGE_ANNOUNCEMENT_ROLES = [
  'SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR',
  'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER',
];

// Public routes
router.get('/', listAnnouncements);
router.get('/:id', getAnnouncement);

// Protected routes
router.get('/:id/reads', protect, getReadStatus);

router.post('/', protect, authorize(...MANAGE_ANNOUNCEMENT_ROLES), [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  validate,
], createAnnouncement);

router.put('/:id', protect, authorize(...MANAGE_ANNOUNCEMENT_ROLES), updateAnnouncement);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, authorize(...MANAGE_ANNOUNCEMENT_ROLES), deleteAnnouncement);

module.exports = router;
