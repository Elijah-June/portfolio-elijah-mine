import { schedule } from '@netlify/functions';
import { query } from './utils/db.js';

async function run() {
  const now = new Date();
  // Compute date in Asia/Singapore regardless of function timezone
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  const key = `${y}-${m}-${d}`; // YYYY-MM-DD

  await query(
    `INSERT INTO activity (date, active)
     VALUES ($1::date, TRUE)
     ON CONFLICT (date) DO UPDATE SET active=TRUE`,
    [key]
  );

  return new Response(`Marked active for ${key}`, { status: 200 });
}

// Run at 16:00 UTC daily (00:00 Asia/Singapore)
export const handler = schedule('0 16 * * *', run);
