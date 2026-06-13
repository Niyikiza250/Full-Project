const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listBulletins } = require('../controllers/bulletinController');

router.use(protect);
router.get('/', listBulletins);

module.exports = router;
