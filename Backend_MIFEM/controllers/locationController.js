const { rwandaLocation } = require('@devrw/rwanda-location');
const { success, error } = require('../utils/response');

const getProvinces = (req, res) => {
  try {
    const provinces = rwandaLocation.getProvinces();
    return success(res, provinces, 'Provinces retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get provinces', 500, err.message);
  }
};

const getDistricts = (req, res) => {
  try {
    const { provinceCode } = req.params;
    const districts = rwandaLocation.getDistricts(provinceCode);
    return success(res, districts, 'Districts retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get districts', 500, err.message);
  }
};

const getSectors = (req, res) => {
  try {
    const { districtCode } = req.params;
    const sectors = rwandaLocation.getSectors(districtCode);
    return success(res, sectors, 'Sectors retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get sectors', 500, err.message);
  }
};

const getCells = (req, res) => {
  try {
    const { sectorCode } = req.params;
    const cells = rwandaLocation.getCells(sectorCode);
    return success(res, cells, 'Cells retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get cells', 500, err.message);
  }
};

const getVillages = (req, res) => {
  try {
    const { cellCode } = req.params;
    const villages = rwandaLocation.getVillages(cellCode);
    return success(res, villages, 'Villages retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get villages', 500, err.message);
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages
};
