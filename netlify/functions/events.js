import { query, successResponse, errorResponse } from './utils/db.js';
import { verifyAccessTokenFromHeader } from './utils/auth.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/events', '');
  const pathSegments = path.split('/').filter(Boolean);
  const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
  const isAdmin = !!(decoded && decoded.role === 'admin');

  try {
    // GET /events
    if (event.httpMethod === 'GET' && pathSegments.length === 0) {
      const { rows } = await query(
        `SELECT id, title, start_at, end_at, ref_type, ref_id 
         FROM events 
         ORDER BY start_at DESC`
      );
      return successResponse(rows);
    }

    // POST /events
    if (event.httpMethod === 'POST' && pathSegments.length === 0) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const { title, start_at, end_at, ref_type, ref_id } = JSON.parse(event.body || '{}');
      
      if (!title || !start_at) {
        return errorResponse('Title and start_at are required', 400);
      }
      
      const { rows } = await query(
        `INSERT INTO events (title, start_at, end_at, ref_type, ref_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, start_at, end_at, ref_type, ref_id`,
        [title, start_at, end_at || null, ref_type || null, ref_id || null]
      );
      
      return successResponse(rows[0], 201);
    }

    // PUT /events/:id
    if (event.httpMethod === 'PUT' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      const { title, start_at, end_at, ref_type, ref_id } = JSON.parse(event.body || '{}');
      
      const { rows } = await query(
        `UPDATE events SET
           title=COALESCE($2, title),
           start_at=COALESCE($3, start_at),
           end_at=COALESCE($4, end_at),
           ref_type=COALESCE($5, ref_type),
           ref_id=COALESCE($6, ref_id)
         WHERE id=$1
         RETURNING id, title, start_at, end_at, ref_type, ref_id`,
        [id, title, start_at, end_at, ref_type, ref_id]
      );
      
      if (rows.length === 0) return errorResponse('Event not found', 404);
      return successResponse(rows[0]);
    }

    // DELETE /events/:id
    if (event.httpMethod === 'DELETE' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      await query('DELETE FROM events WHERE id=$1', [id]);
      return successResponse({ success: true });
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in events function:', error);
    return errorResponse('Internal server error', 500);
  }
};
