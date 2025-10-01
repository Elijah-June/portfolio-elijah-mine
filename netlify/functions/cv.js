import { query, successResponse, errorResponse } from './utils/db.js';
import { verifyAccessTokenFromHeader } from './utils/auth.js';

async function ensureCvTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS cv (
      id INTEGER PRIMARY KEY DEFAULT 1,
      summary TEXT,
      education JSONB NOT NULL DEFAULT '{}'::jsonb,
      experience JSONB NOT NULL DEFAULT '{}'::jsonb,
      skills JSONB NOT NULL DEFAULT '{}'::jsonb,
      certifications JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      },
      body: '',
    };
  }

  const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
  const isAdmin = !!(decoded && decoded.role === 'admin');

  try {
    await ensureCvTable();

    // GET /cv
    if (event.httpMethod === 'GET') {
      const { rows } = await query(
        `SELECT id, summary, education, experience, skills, certifications, updated_at
         FROM cv WHERE id = 1`
      );
      return successResponse(rows[0] || null);
    }

    // PUT /cv (admin only)
    if (event.httpMethod === 'PUT') {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      const body = JSON.parse(event.body || '{}');
      const { summary, education, experience, skills, certifications } = body;

      const { rows } = await query(
        `INSERT INTO cv (id, summary, education, experience, skills, certifications)
         VALUES (1, $1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           summary = COALESCE($1, cv.summary),
           education = COALESCE($2, cv.education),
           experience = COALESCE($3, cv.experience),
           skills = COALESCE($4, cv.skills),
           certifications = COALESCE($5, cv.certifications),
           updated_at = NOW()
         RETURNING id, summary, education, experience, skills, certifications, updated_at`,
        [summary, education || {}, experience || {}, skills || {}, certifications || {}]
      );

      return successResponse(rows[0]);
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Error in cv function:', error);
    return errorResponse('Internal server error', 500);
  }
};
