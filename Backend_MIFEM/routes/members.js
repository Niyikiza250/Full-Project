const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listMembers, getMember, createMember, updateMember, deleteMember, getMemberActivities, createMemberActivity, listChangeRequests, approveChangeRequest, rejectChangeRequest, createChangeRequest } = require('../controllers/memberController');

router.use(protect);

// Change requests — MUST be before /:id routes to avoid route shadowing
router.get('/change-requests/all', listChangeRequests);
router.post('/change-requests', [
  body('type').notEmpty().withMessage('Type is required'),
  body('changes').notEmpty().withMessage('Changes are required'),
  validate,
], createChangeRequest);
router.put('/change-requests/:id/approve', approveChangeRequest);
router.put('/change-requests/:id/reject', rejectChangeRequest);

router.get('/', listMembers);
router.get('/:id', getMember);
router.get('/:id/activities', getMemberActivities);

router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  validate,
], createMember);

router.post('/:id/activities', [
  body('type').notEmpty().withMessage('Activity type is required'),
  validate,
], createMemberActivity);

router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
