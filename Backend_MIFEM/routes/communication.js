const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listMessages, sendMessage, markMessageRead, listSmsTemplates, createSmsTemplate, updateSmsTemplate, deleteSmsTemplate } = require('../controllers/communicationController');

router.use(protect);

// Internal messages
router.get('/messages', listMessages);
router.post('/messages', [
  body('subject').notEmpty().withMessage('Subject is required'),
  validate,
], sendMessage);
router.put('/messages/:id/read', markMessageRead);

// SMS Templates
router.get('/sms-templates', listSmsTemplates);
router.post('/sms-templates', [
  body('name').notEmpty().withMessage('Name is required'),
  body('body').notEmpty().withMessage('Body is required'),
  validate,
], createSmsTemplate);
router.put('/sms-templates/:id', updateSmsTemplate);
router.delete('/sms-templates/:id', deleteSmsTemplate);

module.exports = router;
