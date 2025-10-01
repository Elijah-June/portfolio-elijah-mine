import dotenv from 'dotenv';
import path from 'path';
import url from 'url';

// Load env from server/.env (default) and also try repo root .env (parent dir)
dotenv.config();
const __dirnameLocal = path.dirname(url.fileURLToPath(import.meta.url));
const serverEnv = path.resolve(__dirnameLocal, '..', '.env');
const rootEnv = path.resolve(__dirnameLocal, '..', '..', '.env');
dotenv.config({ path: serverEnv });
dotenv.config({ path: rootEnv });

const env = (key, def) => (process.env[key] ?? def);

export const config = {
  port: Number(env('PORT', 4000)),
  nodeEnv: env('NODE_ENV', 'development'),
  databaseUrl: env('DATABASE_URL'),
  clientUrl: env('CLIENT_URL', 'http://localhost:5173'),
  cookieDomain: env('COOKIE_DOMAIN', ''),
  jwt: {
    accessSecret: env('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessExpiresIn: env('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpiresIn: env('JWT_REFRESH_EXPIRES', '7d'),
  },
  tz: env('TZ', 'Asia/Singapore'),
};

export const isProd = config.nodeEnv === 'production';
