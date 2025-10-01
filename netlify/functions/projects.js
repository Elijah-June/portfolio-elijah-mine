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

  const path = event.path.replace('/.netlify/functions/projects', '');
  const pathSegments = path.split('/').filter(Boolean);
  const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
  const isAdmin = !!(decoded && decoded.role === 'admin');

  try {
    // GET /projects
    if (event.httpMethod === 'GET' && pathSegments.length === 0) {
      const { rows } = await query(
        `SELECT id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at 
         FROM projects 
         ORDER BY created_at DESC`
      );
      return successResponse(rows);
    }

    // POST /projects
    if (event.httpMethod === 'POST' && pathSegments.length === 0) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const { 
        title, 
        description, 
        tags, 
        repo_url, 
        demo_url, 
        image_url 
      } = JSON.parse(event.body || '{}');
      
      if (!title) {
        return errorResponse('Title is required', 400);
      }
      
      const { rows } = await query(
        `INSERT INTO projects (title, description, tags, repo_url, demo_url, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at`,
        [
          title,
          description || null,
          tags || [],
          repo_url || null,
          demo_url || null,
          image_url || null
        ]
      );
      
      return successResponse(rows[0], 201);
    }

    // PUT /projects/:id
    if (event.httpMethod === 'PUT' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      const { 
        title, 
        description, 
        tags, 
        repo_url, 
        demo_url, 
        image_url 
      } = JSON.parse(event.body || '{}');
      
      const { rows } = await query(
        `UPDATE projects SET
           title=COALESCE($2, title),
           description=COALESCE($3, description),
           tags=COALESCE($4, tags),
           repo_url=COALESCE($5, repo_url),
           demo_url=COALESCE($6, demo_url),
           image_url=COALESCE($7, image_url),
           updated_at=NOW()
         WHERE id=$1
         RETURNING id, title, description, tags, repo_url, demo_url, image_url, created_at, updated_at`,
        [
          id,
          title,
          description,
          tags,
          repo_url,
          demo_url,
          image_url
        ]
      );
      
      if (rows.length === 0) return errorResponse('Project not found', 404);
      return successResponse(rows[0]);
    }

    // DELETE /projects/:id
    if (event.httpMethod === 'DELETE' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      await query('DELETE FROM projects WHERE id=$1', [id]);
      return successResponse({ success: true });
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in projects function:', error);
    return errorResponse('Internal server error', 500);
  }
};
