const { rwandaLocation } = require('@devrw/rwanda-location');
const { success, error } = require('../utils/response');

const getProvinces = (req, res) => {
  try {
    const provinces = rwandaLocation.getProvinces();
    return success(res, provinces, 'Provinces retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get provinces', 500);
  }
};

const getDistricts = (req, res) => {
  try {
    const provinceCode = Number(req.params.provinceCode);
    const districts = rwandaLocation.getDistricts(provinceCode);
    return success(res, districts, 'Districts retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get districts', 500);
  }
};

const getSectors = (req, res) => {
  try {
    const districtCode = Number(req.params.districtCode);
    const sectors = rwandaLocation.getSectors(districtCode);
    return success(res, sectors, 'Sectors retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get sectors', 500);
  }
};

const getCells = (req, res) => {
  try {
    const sectorCode = req.params.sectorCode;
    const cells = rwandaLocation.getCells(sectorCode);
    return success(res, cells, 'Cells retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get cells', 500);
  }
};

const getVillages = (req, res) => {
  try {
    const cellCode = Number(req.params.cellCode);
    const villages = rwandaLocation.getVillages(cellCode);
    return success(res, villages, 'Villages retrieved successfully');
  } catch (err) {
    return error(res, 'Failed to get villages', 500);
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getSectors,
  getCells,
  getVillages
};
