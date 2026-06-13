const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { listBlueCards, getBlueCard, createBlueCard, updateBlueCard, deleteBlueCard, saveMissionWords } = require('../controllers/blueCardController');

router.use(protect);

router.get('/', listBlueCards);
router.get('/:id', getBlueCard);

router.post('/', createBlueCard);
router.put('/:id', updateBlueCard);
router.put('/:id/mission-words', saveMissionWords);
router.delete('/:id', deleteBlueCard);

module.exports = router;
