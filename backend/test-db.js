import db from './db.js';
async function test() {
  const { rows } = await db.query('SELECT * FROM Production_Batches');
  console.log('Batches:', rows);
  process.exit(0);
}
test();
