const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  listAchievements,
  saveAchievement,
  deleteAchievement,
  uploadAchievementImage,
} = require('../controllers/achievementController');

router.get('/data', listAchievements);
router.put('/data/:id.json', protect, authorize('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'), saveAchievement);
router.delete('/data/:id.json', protect, authorize('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'), deleteAchievement);
router.put('/images/:id.png', protect, authorize('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'), uploadAchievementImage);

module.exports = router;
