import { query, successResponse, errorResponse } from './utils/db.js';

export async function handler(event) {
  try {
    await query(`CREATE TABLE IF NOT EXISTS visitors_counter (
      id INT PRIMARY KEY,
      total BIGINT NOT NULL DEFAULT 0
    )`);

    if (event.httpMethod === 'GET') {
      // Ensure a row exists
      const existing = await query('SELECT total FROM visitors_counter WHERE id = 1');
      if (existing.rowCount === 0) {
        const inserted = await query('INSERT INTO visitors_counter (id, total) VALUES (1, 0) RETURNING total');
        return successResponse({ total: inserted.rows[0].total });
      }
      return successResponse({ total: existing.rows[0].total });
    }

    if (event.httpMethod === 'POST') {
      const updated = await query(
        'UPDATE visitors_counter SET total = total + 1 WHERE id = 1 RETURNING total'
      );

      let total;
      if (updated.rowCount === 0) {
        const inserted = await query(
          'INSERT INTO visitors_counter (id, total) VALUES (1, 1) RETURNING total'
        );
        total = inserted.rows[0].total;
      } else {
        total = updated.rows[0].total;
      }

      return successResponse({ total });
    }

    return errorResponse('Method Not Allowed', 405);
  } catch (err) {
    return errorResponse('Failed to update visitors');
  }
}
