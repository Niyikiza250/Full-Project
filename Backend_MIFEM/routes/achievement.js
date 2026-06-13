const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listAchievements,
  saveAchievement,
  deleteAchievement,
  uploadAchievementImage,
} = require('../controllers/achievementController');

router.get('/data', listAchievements);
router.put('/data/:id.json', protect, saveAchievement);
router.delete('/data/:id.json', protect, deleteAchievement);
router.put('/images/:id.png', protect, uploadAchievementImage);

module.exports = router;
