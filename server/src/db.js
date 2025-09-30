import pkg from 'pg';
import { config, isProd } from './config.js';

const { Pool } = pkg;

if (!config.databaseUrl) {
  console.warn('[db] DATABASE_URL is not set. Database operations will fail until configured.');
}

const needsSSL = (() => {
  if (!config.databaseUrl) return false;
  return /neon\.tech|render\.com|railway\.app|amazonaws\.com/i.test(config.databaseUrl) || isProd;
})();

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

export async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
