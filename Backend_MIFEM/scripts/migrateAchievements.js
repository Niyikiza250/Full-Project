const path = require('path');
const fs = require('fs');
const { sequelize } = require('../config/db');
const Achievement = require('../models/Achievement');

const DATA_DIR = process.env.ACHIEVEMENT_DATA_DIR || path.join(__dirname, 'data');
const BATCH_SIZE = 50;

const readJsonFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory not found: ${DATA_DIR}`);
    console.error('Set ACHIEVEMENT_DATA_DIR env var to point to the directory containing achievement JSON files.');
    process.exit(1);
  }
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  files.sort();

  return files.map(file => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  });
};

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const achievements = readJsonFiles();
    console.log(`Found ${achievements.length} achievement files`);

    let created = 0;
    let updated = 0;

    for (let i = 0; i < achievements.length; i += BATCH_SIZE) {
      const batch = achievements.slice(i, i + BATCH_SIZE);

      for (const data of batch) {
        const record = {
          id: data.id,
          kind: data.kind || 'STORY',
          title: data.title || '',
          summary: data.summary || '',
          coverUrl: data.coverUrl || '',
          publishedAt: data.publishedAt || null,
          author: data.author || '',
          tags: data.tags || [],
          status: data.status || 'APPROVED',
          isCustom: data.isCustom !== undefined ? data.isCustom : true,
          galleryUrls: data.galleryUrls || [],
        };

        const [instance, isNew] = await Achievement.findOrCreate({
          where: { id: record.id },
          defaults: record,
        });

        if (!isNew) {
          await instance.update(record);
          updated++;
        } else {
          created++;
        }

        console.log(`  ${isNew ? 'CREATED' : 'UPDATED'}: ${record.id} - ${record.title.slice(0, 50)}`);
      }
    }

    console.log(`\nDone! ${created} created, ${updated} updated`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

migrate();
