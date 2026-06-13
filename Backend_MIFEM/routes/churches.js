const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { hierarchyScope } = require('../middleware/hierarchyAccess');
const {
  listUnions, getUnion, createUnion, updateUnion, deleteUnion,
  listFields, getField, createField, updateField, deleteField,
  listDistricts, getDistrict, createDistrict, updateDistrict, deleteDistrict,
  listChurches, getChurch, createChurch, updateChurch, deleteChurch,
  listNearbyChurches,
  listMinistries, createMinistry, updateMinistry, deleteMinistry,
  assignMinistryMember, assignMinistryLeader, removeMinistryMember,
} = require('../controllers/churchController');

// Public read endpoints (for registration)
router.get('/fields', listFields);
router.get('/fields/:id', getField);
router.get('/districts', listDistricts);
router.get('/districts/:id', getDistrict);

// Nearby churches (public) — must be before /:id
router.get('/nearby', listNearbyChurches);

// Churches (public read)
router.get('/', listChurches);
router.get('/:id', getChurch);

// Unions (protected)
router.get('/unions', protect, listUnions);
router.get('/unions/:id', protect, getUnion);
router.post('/unions', protect, [body('name').notEmpty(), validate], createUnion);
router.put('/unions/:id', protect, updateUnion);
router.delete('/unions/:id', protect, deleteUnion);

// Fields (protected write, public read already above)
router.post('/fields', protect, [body('name').notEmpty(), body('unionId').notEmpty(), validate], createField);
router.put('/fields/:id', protect, updateField);
router.delete('/fields/:id', protect, deleteField);

// Districts (protected write, public read already above)
router.post('/districts', protect, [body('name').notEmpty(), body('fieldId').notEmpty(), validate], createDistrict);
router.put('/districts/:id', protect, updateDistrict);
router.delete('/districts/:id', protect, deleteDistrict);

// Churches (protected write, public read already above)
router.post('/', protect, [body('name').notEmpty(), body('districtId').notEmpty(), validate], createChurch);
router.put('/:id', protect, updateChurch);
router.delete('/:id', protect, deleteChurch);

// Ministries
router.get('/ministries', protect, listMinistries);
router.post('/ministries', protect, [body('name').notEmpty(), validate], createMinistry);
router.put('/ministries/:id', protect, updateMinistry);
router.delete('/ministries/:id', protect, deleteMinistry);

// Ministry assignments (Field Admin+)
router.post('/ministries/:id/assign', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, assignMinistryMember);
router.post('/ministries/:id/assign-leader', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, assignMinistryLeader);
router.post('/ministries/:id/remove', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, removeMinistryMember);

module.exports = router;
