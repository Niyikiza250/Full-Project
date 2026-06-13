const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/provinces', locationController.getProvinces);
router.get('/districts/:provinceCode', locationController.getDistricts);
router.get('/sectors/:districtCode', locationController.getSectors);
router.get('/cells/:sectorCode', locationController.getCells);
router.get('/villages/:cellCode', locationController.getVillages);

module.exports = router;
