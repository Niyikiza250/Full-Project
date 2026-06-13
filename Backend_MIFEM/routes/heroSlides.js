const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listSlides, batchSaveSlides, uploadSlideImage } = require('../controllers/heroSlidesController');

router.get('/', listSlides);
router.put('/', protect, batchSaveSlides);
router.put('/:id/image', protect, uploadSlideImage);

module.exports = router;
