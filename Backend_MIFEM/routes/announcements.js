const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, markAsRead, getReadStatus } = require('../controllers/announcementController');

// Public routes
router.get('/', listAnnouncements);
router.get('/:id', getAnnouncement);

// Protected routes
router.get('/:id/reads', protect, getReadStatus);

router.post('/', protect, [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  validate,
], createAnnouncement);

router.put('/:id', protect, updateAnnouncement);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;
