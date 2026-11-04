const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listSpecialNeeds, getSpecialNeed, createSpecialNeed, updateSpecialNeed, deleteSpecialNeed,
} = require('../controllers/specialNeedController');

const router = express.Router();
router.use(protect);

router.get('/', listSpecialNeeds);
router.get('/:id', getSpecialNeed);
router.post('/', [
  body('memberId').notEmpty(),
  body('needType').notEmpty(),
  validate,
], createSpecialNeed);
router.put('/:id', updateSpecialNeed);
router.delete('/:id', deleteSpecialNeed);

module.exports = router;
