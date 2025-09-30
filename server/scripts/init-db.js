import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function main() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('[init-db] Applying schema...');
  await pool.query(sql);
  console.log('[init-db] Done.');
  await pool.end();
}

main().catch((err) => {
  console.error('[init-db] Error:', err);
  process.exit(1);
});
