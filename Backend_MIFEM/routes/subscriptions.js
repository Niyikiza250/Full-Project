const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { subscribe, unsubscribe, listSubscriptions } = require('../controllers/subscriptionController');

router.post('/', [
  body('email').isEmail().withMessage('Valid email required'),
  validate,
], subscribe);

router.post('/unsubscribe', [
  body('email').isEmail().withMessage('Valid email required'),
  validate,
], unsubscribe);

router.get('/', protect, listSubscriptions);

module.exports = router;
