const express = require('express');
const { protect } = require('../middleware/auth');
const { listAvailability, saveAvailability } = require('../controllers/availabilityController');

const router = express.Router();
router.use(protect);

router.get('/', listAvailability);
router.put('/', saveAvailability);

module.exports = router;
