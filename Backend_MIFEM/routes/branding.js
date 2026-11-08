const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBranding,
  saveBrandAsset,
  resetBrandAsset,
} = require('../controllers/brandingController');

router.get('/', getBranding);
router.put('/:asset', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), saveBrandAsset);
router.delete('/:asset', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), resetBrandAsset);

module.exports = router;
