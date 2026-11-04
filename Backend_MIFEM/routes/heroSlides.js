const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { listSlides, batchSaveSlides, uploadSlideImage } = require('../controllers/heroSlidesController');

router.get('/', listSlides);
router.put('/', protect, authorize('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'), batchSaveSlides);
router.put('/:id/image', protect, authorize('SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'), uploadSlideImage);

module.exports = router;
