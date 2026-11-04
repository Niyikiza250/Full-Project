const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listGroups, getGroup, createGroup, updateGroup, deleteGroup,
  addGroupMember, removeGroupMember, listGroupMembers,
} = require('../controllers/groupController');

const router = express.Router();
router.use(protect);

router.get('/', listGroups);
router.get('/:id', getGroup);
router.post('/', [body('name').notEmpty(), validate], createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

router.get('/:groupId/members', listGroupMembers);
router.post('/:groupId/members', [body('memberId').notEmpty(), validate], addGroupMember);
router.delete('/:groupId/members/:memberId', removeGroupMember);

module.exports = router;
