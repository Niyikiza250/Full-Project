const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listMembers, getMember, createMember, updateMember, deleteMember, getMemberActivities, createMemberActivity, listChangeRequests, approveChangeRequest, rejectChangeRequest, createChangeRequest } = require('../controllers/memberController');

const MANAGE_MEMBER_ROLES = [
  'SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR',
  'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER',
];

router.use(protect);

// Change requests — MUST be before /:id routes to avoid route shadowing
router.get('/change-requests/all', listChangeRequests);
router.post('/change-requests', [
  body('type').notEmpty().withMessage('Type is required'),
  body('changes').notEmpty().withMessage('Changes are required'),
  validate,
], createChangeRequest);
router.put('/change-requests/:id/approve', authorize(...MANAGE_MEMBER_ROLES), approveChangeRequest);
router.put('/change-requests/:id/reject', authorize(...MANAGE_MEMBER_ROLES), rejectChangeRequest);

router.get('/', listMembers);
router.get('/:id', getMember);
router.get('/:id/activities', getMemberActivities);

router.post('/', authorize(...MANAGE_MEMBER_ROLES), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('churchId').notEmpty().withMessage('Church is required'),
  body('emergencyName').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyPhone').notEmpty().withMessage('Emergency contact phone is required'),
  validate,
], createMember);

router.post('/:id/activities', authorize(...MANAGE_MEMBER_ROLES), [
  body('type').notEmpty().withMessage('Activity type is required'),
  validate,
], createMemberActivity);

router.put('/:id', authorize(...MANAGE_MEMBER_ROLES), updateMember);
router.delete('/:id', authorize(...MANAGE_MEMBER_ROLES), deleteMember);

module.exports = router;
