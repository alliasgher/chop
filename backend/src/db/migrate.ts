import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from './client';

async function migrate() {
  const sql = readFileSync(join(__dirname, 'migrations/001_initial.sql'), 'utf8');
  await db.query(sql);
  console.log('Migration complete');
  await db.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
