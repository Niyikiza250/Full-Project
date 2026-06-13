const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listGroups, getGroup, createGroup, updateGroup, deleteGroup,
} = require('../controllers/groupMessageController');

const router = express.Router();
router.use(protect);

router.get('/', listGroups);
router.get('/:id', getGroup);
router.post('/', [body('name').notEmpty(), validate], createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
