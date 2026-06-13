const express = require('express');
const router = express.Router();
const { healthCheck, databaseHealth } = require('../controllers/healthController');

router.get('/', healthCheck);
router.get('/database', databaseHealth);

module.exports = router;
