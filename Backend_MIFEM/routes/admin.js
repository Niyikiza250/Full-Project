const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listAuditLogs, listAdminActivity } = require('../controllers/adminController');

router.use(protect);
router.get('/audit-logs', listAuditLogs);
router.get('/admin-activity', listAdminActivity);

module.exports = router;
