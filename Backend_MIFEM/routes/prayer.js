const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listPrayerRequests, getPrayerRequest, createPrayerRequest, updatePrayerRequest, deletePrayerRequest,
  listCounselingRequests, getCounselingRequest, createCounselingRequest, updateCounselingRequest, deleteCounselingRequest,
  getPrayerStats, getCounselingStats,
} = require('../controllers/prayerController');

const router = express.Router();
router.use(protect);

router.get('/prayer-requests', listPrayerRequests);
router.get('/prayer-requests/stats', getPrayerStats);
router.get('/prayer-requests/:id', getPrayerRequest);
router.post('/prayer-requests', [
  body('name').notEmpty(),
  body('request').notEmpty(),
  validate,
], createPrayerRequest);
router.put('/prayer-requests/:id', updatePrayerRequest);
router.delete('/prayer-requests/:id', deletePrayerRequest);

router.get('/counseling-requests', listCounselingRequests);
router.get('/counseling-requests/stats', getCounselingStats);
router.get('/counseling-requests/:id', getCounselingRequest);
router.post('/counseling-requests', [
  body('name').notEmpty(),
  body('description').notEmpty(),
  validate,
], createCounselingRequest);
router.put('/counseling-requests/:id', updateCounselingRequest);
router.delete('/counseling-requests/:id', deleteCounselingRequest);

module.exports = router;
