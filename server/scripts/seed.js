import bcrypt from 'bcrypt';
import { query, pool } from '../src/db.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME || null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Programs must be written for people to read.', author: 'Harold Abelson' },
  { text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth' },
  { text: 'Code is like humor. When you have to explain it, it’s bad.', author: 'Cory House' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' }
];

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('[seed] ADMIN_EMAIL and ADMIN_PASSWORD are required to seed admin. Skipping admin seed.');
    return;
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
    [ADMIN_EMAIL, hash]
  );
  await query(
    `INSERT INTO profile (id, display_name) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name`,
    [ADMIN_NAME]
  );
  console.log('[seed] Admin user upserted:', ADMIN_EMAIL);
}

async function seedQuotes() {
  for (const q of QUOTES) {
    await query(
      `INSERT INTO quotes (text, author)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [q.text, q.author || null]
    );
  }
  console.log('[seed] Quotes inserted (duplicates ignored).');
}

async function main() {
  await seedAdmin();
  await seedQuotes();
  await pool.end();
  console.log('[seed] Done.');
}

main().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
