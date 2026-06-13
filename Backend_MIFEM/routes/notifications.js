const express = require('express');
const { protect } = require('../middleware/auth');
const {
  listNotifications, markNotificationRead, markAllRead, getUnreadCount, deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();
router.use(protect);

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

module.exports = router;
