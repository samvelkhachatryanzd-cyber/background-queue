require('dotenv').config({ quiet: true });
const { sequelize } = require('../src/models');

const COUNT = Number(process.env.SEED_SUBSCRIBERS) || 1000;
const FIRST_NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Elena', 'Felix', 'Grace', 'Hugo', 'Iris', 'Jonas', 'Kate', 'Leo', 'Mia', 'Noah', 'Olga', 'Paul'];
const LAST_NAMES = ['Adams', 'Brown', 'Clark', 'Davis', 'Evans', 'Fisher', 'Garcia', 'Hill', 'Jones', 'King', 'Lewis', 'Miller', 'Nelson', 'Owen', 'Parker', 'Reed'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  const [[{ n }]] = await sequelize.query('SELECT COUNT(*) AS n FROM subscribers');
  if (Number(n) > 0) {
    console.error(`subscribers already has ${n} rows. Run "npm run db:reset" to start over.`);
    process.exit(1);
  }

  const queryInterface = sequelize.getQueryInterface();
  let batch = [];
  for (let i = 1; i <= COUNT; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    batch.push({
      name: `${first} ${last}`,
      email: `${first}.${last}.${i}@example.com`.toLowerCase(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    if (batch.length === 1000) {
      await queryInterface.bulkInsert('subscribers', batch);
      batch = [];
    }
  }
  if (batch.length) await queryInterface.bulkInsert('subscribers', batch);

  console.log(`inserted ${COUNT} subscribers`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
