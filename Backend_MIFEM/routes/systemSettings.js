const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getSetting, saveSetting, getLanguage, saveLanguage, listSettings, testSmtp } = require('../controllers/systemSettingsController');

router.get('/', protect, listSettings);
router.get('/language', getLanguage);
router.get('/:key', getSetting);

router.put('/language', protect, [
  body('language').isIn(['en', 'rw']).withMessage('Language must be "en" or "rw"'),
  validate,
], saveLanguage);

router.post('/smtp-test', protect, [
  body('host').notEmpty().withMessage('Host is required'),
  body('port').notEmpty().withMessage('Port is required'),
  body('user').notEmpty().withMessage('User is required'),
  body('pass').notEmpty().withMessage('Password is required'),
  validate,
], testSmtp);

router.put('/:key', protect, [
  body('value').custom(v => v !== undefined).withMessage('Value is required'),
  validate,
], saveSetting);

module.exports = router;
