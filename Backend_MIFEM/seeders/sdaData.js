const { Union, Field, District, Church } = require('../models');
const logger = require('../utils/logger');

const RUM_UNION = {
  name: 'Rwanda Union Mission',
  code: 'RUM',
  address: 'Kigali, Rwanda',
};

const FIELDS = [
  {
    name: 'Central Rwanda Field',
    code: 'CRF',
    districts: [
      {
        name: 'Kigali City District',
        churches: [
          { name: 'Kigali Central Church', latitude: -1.9441, longitude: 30.0619, address: 'KN 5 Rd, Kigali' },
          { name: 'Remera SDA Church', latitude: -1.9517, longitude: 30.0878, address: 'Remera, Kigali' },
          { name: 'Kacyiru SDA Church', latitude: -1.9399, longitude: 30.0825, address: 'Kacyiru, Kigali' },
          { name: 'Kimihurura SDA Church', latitude: -1.9567, longitude: 30.0894, address: 'Kimihurura, Kigali' },
          { name: 'Gisozi SDA Church', latitude: -1.9300, longitude: 30.0700, address: 'Gisozi, Kigali' },
        ],
      },
      {
        name: 'Muhanga District',
        churches: [
          { name: 'Muhanga Central Church', latitude: -2.0833, longitude: 29.7500, address: 'Muhanga' },
          { name: 'Rongi SDA Church', latitude: -2.0500, longitude: 29.7200, address: 'Rongi, Muhanga' },
        ],
      },
      {
        name: 'Kamonyi District',
        churches: [
          { name: 'Kamonyi SDA Church', latitude: -2.0000, longitude: 29.9000, address: 'Kamonyi' },
          { name: 'Runda SDA Church', latitude: -2.0300, longitude: 29.8800, address: 'Runda, Kamonyi' },
        ],
      },
    ],
  },
  {
    name: 'East Rwanda Field',
    code: 'ERF',
    districts: [
      {
        name: 'Rwamagana District',
        churches: [
          { name: 'Rwamagana SDA Church', latitude: -1.9500, longitude: 30.4333, address: 'Rwamagana' },
          { name: 'Nyakariro SDA Church', latitude: -1.9200, longitude: 30.4600, address: 'Nyakariro, Rwamagana' },
        ],
      },
      {
        name: 'Nyagatare District',
        churches: [
          { name: 'Nyagatare Central Church', latitude: -1.2989, longitude: 30.3281, address: 'Nyagatare' },
          { name: 'Karama SDA Church', latitude: -1.3500, longitude: 30.3000, address: 'Karama, Nyagatare' },
        ],
      },
      {
        name: 'Kayonza District',
        churches: [
          { name: 'Kayonza SDA Church', latitude: -1.7000, longitude: 30.5167, address: 'Kayonza' },
          { name: 'Mukarange SDA Church', latitude: -1.6700, longitude: 30.5400, address: 'Mukarange, Kayonza' },
        ],
      },
      {
        name: 'Bugesera District',
        churches: [
          { name: 'Bugesera Central Church', latitude: -2.2000, longitude: 30.1000, address: 'Bugesera' },
          { name: 'Nyamata SDA Church', latitude: -2.1500, longitude: 30.0800, address: 'Nyamata, Bugesera' },
        ],
      },
    ],
  },
  {
    name: 'North Rwanda Field',
    code: 'NRF',
    districts: [
      {
        name: 'Musanze District',
        churches: [
          { name: 'Musanze SDA Church', latitude: -1.5000, longitude: 29.6333, address: 'Musanze' },
          { name: 'Ruhengeri Central Church', latitude: -1.5000, longitude: 29.6350, address: 'Ruhengeri, Musanze' },
        ],
      },
      {
        name: 'Gicumbi District',
        churches: [
          { name: 'Gicumbi Central Church', latitude: -1.6000, longitude: 30.0000, address: 'Gicumbi' },
          { name: 'Byumba SDA Church', latitude: -1.5800, longitude: 30.0600, address: 'Byumba, Gicumbi' },
        ],
      },
      {
        name: 'Rulindo District',
        churches: [
          { name: 'Rulindo SDA Church', latitude: -1.7333, longitude: 29.9833, address: 'Rulindo' },
          { name: 'Tumba SDA Church', latitude: -1.7000, longitude: 30.0000, address: 'Tumba, Rulindo' },
        ],
      },
    ],
  },
  {
    name: 'South Rwanda Field',
    code: 'SRF',
    districts: [
      {
        name: 'Huye District',
        churches: [
          { name: 'Huye Central Church', latitude: -2.6000, longitude: 29.7333, address: 'Huye' },
          { name: 'Butare SDA Church', latitude: -2.5967, longitude: 29.7375, address: 'Butare, Huye' },
        ],
      },
      {
        name: 'Nyamagabe District',
        churches: [
          { name: 'Nyamagabe SDA Church', latitude: -2.4500, longitude: 29.5667, address: 'Nyamagabe' },
          { name: 'Gikongoro SDA Church', latitude: -2.4800, longitude: 29.5500, address: 'Gikongoro, Nyamagabe' },
        ],
      },
      {
        name: 'Nyanza District',
        churches: [
          { name: 'Nyanza SDA Church', latitude: -2.3500, longitude: 29.7333, address: 'Nyanza' },
          { name: 'Rwesero SDA Church', latitude: -2.3300, longitude: 29.7500, address: 'Rwesero, Nyanza' },
        ],
      },
      {
        name: 'Ruhango District',
        churches: [
          { name: 'Ruhango SDA Church', latitude: -2.2000, longitude: 29.7500, address: 'Ruhango' },
          { name: 'Kinazi SDA Church', latitude: -2.2300, longitude: 29.7200, address: 'Kinazi, Ruhango' },
        ],
      },
    ],
  },
  {
    name: 'West Rwanda Field',
    code: 'WRF',
    districts: [
      {
        name: 'Rubavu District',
        churches: [
          { name: 'Rubavu Central Church', latitude: -1.6833, longitude: 29.3500, address: 'Rubavu' },
          { name: 'Gisenyi North Church', latitude: -1.6789, longitude: 29.3567, address: 'Gisenyi, Rubavu' },
        ],
      },
      {
        name: 'Rusizi District',
        churches: [
          { name: 'Rusizi Valley Church', latitude: -2.4833, longitude: 28.9000, address: 'Rusizi' },
          { name: 'Kamembe SDA Church', latitude: -2.4600, longitude: 28.9200, address: 'Kamembe, Rusizi' },
        ],
      },
      {
        name: 'Nyamasheke District',
        churches: [
          { name: 'Nyamasheke Church', latitude: -2.3667, longitude: 29.1167, address: 'Nyamasheke' },
          { name: 'Karengera SDA Church', latitude: -2.3800, longitude: 29.1000, address: 'Karengera, Nyamasheke' },
        ],
      },
      {
        name: 'Karongi District',
        churches: [
          { name: 'Karongi SDA Church', latitude: -2.0317, longitude: 29.3498, address: 'Karongi' },
          { name: 'Kibuye SDA Church', latitude: -2.0600, longitude: 29.3500, address: 'Kibuye, Karongi' },
        ],
      },
    ],
  },
];

const seedSdaData = async () => {
  logger.info('Seeding SDA Church Location Data...');

  const [union] = await Union.findOrCreate({
    where: { code: RUM_UNION.code },
    defaults: RUM_UNION,
  });

  logger.info(`Union: ${union.name} (${union.id})`);

  for (const fieldData of FIELDS) {
    const [field] = await Field.findOrCreate({
      where: { code: fieldData.code },
      defaults: { name: fieldData.name, code: fieldData.code, unionId: union.id },
    });

    logger.info(`  Field: ${field.name} (${field.id})`);

    for (const districtData of fieldData.districts) {
      const [district] = await District.findOrCreate({
        where: { name: districtData.name, fieldId: field.id },
        defaults: { name: districtData.name, fieldId: field.id },
      });

      logger.info(`    District: ${district.name} (${district.id})`);

      for (const churchData of districtData.churches) {
        const [church] = await Church.findOrCreate({
          where: { name: churchData.name, districtId: district.id },
          defaults: {
            name: churchData.name,
            districtId: district.id,
            fieldId: field.id,
            latitude: churchData.latitude,
            longitude: churchData.longitude,
            address: churchData.address || '',
          },
        });

        logger.info(`      Church: ${church.name} (${church.id})`);
      }
    }
  }

  logger.info('SDA Church Location Data seeded successfully');
};

module.exports = { seedSdaData };
