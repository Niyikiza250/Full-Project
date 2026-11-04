const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listBlueCards, getBlueCard, createBlueCard, updateBlueCard, deleteBlueCard, saveMissionWords } = require('../controllers/blueCardController');

const MANAGE_BLUE_CARD_ROLES = ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'];

router.use(protect);

router.get('/', listBlueCards);
router.get('/:id', getBlueCard);

router.post('/', authorize(...MANAGE_BLUE_CARD_ROLES), createBlueCard);
router.put('/:id', authorize(...MANAGE_BLUE_CARD_ROLES), updateBlueCard);
router.put('/:id/mission-words', authorize(...MANAGE_BLUE_CARD_ROLES), saveMissionWords);
router.delete('/:id', authorize(...MANAGE_BLUE_CARD_ROLES), deleteBlueCard);

module.exports = router;
