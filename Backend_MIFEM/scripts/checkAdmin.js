const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:12345@127.0.0.1:5432/mifem_db', {
  dialect: 'postgres',
  logging: false,
});

async function check() {
  await sequelize.authenticate();
  console.log('Database connected');

  const [users] = await sequelize.query(
    `SELECT id, name, email, password, account_status, created_at FROM users WHERE email = 'admin@mifem.org';`
  );

  if (users.length > 0) {
    console.log('Full password value:', JSON.stringify(users[0].password));
    console.log('Length:', users[0].password.length);
  }

  if (users.length === 0) {
    console.log('No admin user found in database. Seeding may not have run.');
    console.log('Checking all users...');
    const [allUsers] = await sequelize.query('SELECT id, name, email, account_status FROM users;');
    if (allUsers.length === 0) {
      console.log('Users table is empty. Run: npm run seed');
    } else {
      console.log('Users found in database:');
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.name}) [${u.account_status}]`));
    }
    await sequelize.close();
    return;
  }

  const user = users[0];
  console.log('\n=== Admin User Found ===');
  console.log('ID:', user.id);
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Password hash:', user.password.substring(0, 30) + '...');
  console.log('Status:', user.account_status);
  console.log('Created:', user.created_at);

  const expected = 'Admin@123';
  const match = await bcrypt.compare(expected, user.password);
  console.log(`\nPassword "${expected}" matches:`, match);

  if (!match) {
    console.log('\nTrying other common passwords...');
    const attempts = ['admin123', 'Admin123', 'password', 'admin@123', 'Admin@1234', 'Password123', 'mifem123', 'Mifem@123'];
    for (const pw of attempts) {
      const m = await bcrypt.compare(pw, user.password);
      if (m) {
        console.log('>>> FOUND matching password:', pw);
        break;
      }
    }
    console.log('No common password matched either.');
  }

  // Fix: reset password with proper bcrypt hash
  console.log('\nResetting password to Admin@123 with bcrypt...');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Admin@123', salt);
  await sequelize.query('UPDATE users SET password = $1 WHERE email = $2', { bind: [hash, 'admin@mifem.org'] });
  console.log('Password updated. Verifying...');

  const [updated] = await sequelize.query(`SELECT password FROM users WHERE email = 'admin@mifem.org';`);
  const verify = await bcrypt.compare('Admin@123', updated[0].password);
  console.log('New password matches Admin@123:', verify);

  await sequelize.close();
}

check().catch(err => { console.error('Error:', err.message); process.exit(1); });
