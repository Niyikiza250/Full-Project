const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listConsents, getConsent, createConsent, updateConsent, revokeConsent,
} = require('../controllers/privacyController');

const router = express.Router();
router.use(protect);

router.get('/', listConsents);
router.get('/:id', getConsent);
router.post('/', [
  body('memberId').notEmpty(),
  body('consentType').notEmpty(),
  validate,
], createConsent);
router.put('/:id', updateConsent);
router.patch('/:id/revoke', revokeConsent);

module.exports = router;
