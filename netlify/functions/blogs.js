import { query, successResponse, errorResponse } from './utils/db.js';
import slugify from 'slugify';
import { verifyAccessTokenFromHeader } from './utils/auth.js';

// Helper function to handle query params
const parseQueryParams = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params.entries()) {
    if (value === 'true') result[key] = true;
    else if (value === 'false') result[key] = false;
    else if (!isNaN(Number(value))) result[key] = Number(value);
    else result[key] = value;
  }
  return result;
};

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

  const path = event.path.replace('/.netlify/functions/blogs', '');
  const pathSegments = path.split('/').filter(Boolean);
  const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
  const isAdmin = !!(decoded && decoded.role === 'admin');

  try {
    // GET /blogs
    if (event.httpMethod === 'GET' && pathSegments.length === 0) {
      const { rows } = await query(
        `SELECT id, title, slug, content_md, published, created_at, updated_at
         FROM blogs ${!isAdmin ? 'WHERE published = TRUE' : ''} ORDER BY created_at DESC`
      );
      return successResponse(rows);
    }

    // GET /blogs/:slug
    if (event.httpMethod === 'GET' && pathSegments.length === 1) {
      const slug = pathSegments[0];
      const { rows } = await query(
        `SELECT id, title, slug, content_md, published, created_at, updated_at 
         FROM blogs WHERE slug=$1 ${!isAdmin ? 'AND published = TRUE' : ''}`,
        [slug]
      );
      if (rows.length === 0) return errorResponse('Blog post not found', 404);
      return successResponse(rows[0]);
    }

    // POST /blogs
    if (event.httpMethod === 'POST' && pathSegments.length === 0) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const { title, content_md, published = true } = JSON.parse(event.body || '{}');
      if (!title) return errorResponse('Title is required', 400);
      
      const baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      
      // Ensure unique slug
      let i = 1;
      while (true) {
        const { rows: exists } = await query('SELECT 1 FROM blogs WHERE slug=$1', [slug]);
        if (exists.length === 0) break;
        slug = `${baseSlug}-${i++}`;
      }
      
      const { rows } = await query(
        `INSERT INTO blogs (title, slug, content_md, published)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, slug, content_md, published, created_at, updated_at`,
        [title, slug, content_md || '', published]
      );
      
      return successResponse(rows[0], 201);
    }

    // PUT /blogs/:id
    if (event.httpMethod === 'PUT' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      const { title, content_md, published } = JSON.parse(event.body || '{}');
      
      const { rows } = await query(
        `UPDATE blogs SET
           title=COALESCE($2, title),
           content_md=COALESCE($3, content_md),
           published=COALESCE($4, published),
           updated_at=NOW()
         WHERE id=$1
         RETURNING id, title, slug, content_md, published, created_at, updated_at`,
        [id, title, content_md, published]
      );
      
      if (rows.length === 0) return errorResponse('Blog post not found', 404);
      return successResponse(rows[0]);
    }

    // DELETE /blogs/:id
    if (event.httpMethod === 'DELETE' && pathSegments.length === 1 && !isNaN(pathSegments[0])) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const id = Number(pathSegments[0]);
      await query('DELETE FROM blogs WHERE id=$1', [id]);
      return successResponse({ success: true });
    }

    // Comments endpoints
    // GET /blogs/:id/comments
    if (event.httpMethod === 'GET' && pathSegments.length === 2 && pathSegments[1] === 'comments') {
      const blogId = Number(pathSegments[0]);
      const { rows } = await query(
        `SELECT id, blog_id, author_name, body, approved, created_at 
         FROM comments
         WHERE blog_id=$1 ${!isAdmin ? 'AND approved=TRUE' : ''} 
         ORDER BY created_at ASC`,
        [blogId]
      );
      
      if (rows.length === 0) return successResponse([]);
      
      const commentIds = rows.map(r => r.id);
      const { rows: reactions } = await query(
        `SELECT comment_id, type, count 
         FROM comment_reactions 
         WHERE comment_id = ANY($1)`,
        [commentIds]
      );
      
      const reactionsMap = reactions.reduce((acc, r) => {
        if (!acc[r.comment_id]) acc[r.comment_id] = {};
        acc[r.comment_id][r.type] = Number(r.count);
        return acc;
      }, {});
      
      const commentsWithReactions = rows.map(comment => ({
        ...comment,
        reactions: reactionsMap[comment.id] || {}
      }));
      
      return successResponse(commentsWithReactions);
    }

    // POST /blogs/:id/comments
    if (event.httpMethod === 'POST' && pathSegments.length === 2 && pathSegments[1] === 'comments') {
      const blogId = Number(pathSegments[0]);
      const { author_name, body } = JSON.parse(event.body || '{}');
      
      if (!body || typeof body !== 'string' || body.trim().length === 0) {
        return errorResponse('Comment body is required', 400);
      }
      
      const name = (author_name && String(author_name).trim()) || 'Guest';
      const { rows } = await query(
        `INSERT INTO comments (blog_id, author_name, body, approved)
         VALUES ($1, $2, $3, $4)
         RETURNING id, blog_id, author_name, body, approved, created_at`,
        [blogId, name, body.trim(), !isAdmin] // Auto-approve if admin
      );
      
      return successResponse(rows[0], 201);
    }

    // PUT /blogs/comments/:commentId
    if (event.httpMethod === 'PUT' && pathSegments.length === 2 && pathSegments[0] === 'comments') {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const commentId = Number(pathSegments[1]);
      const { approved } = JSON.parse(event.body || '{}');
      
      const { rows } = await query(
        `UPDATE comments 
         SET approved=COALESCE($2, approved) 
         WHERE id=$1
         RETURNING id, blog_id, author_name, body, approved, created_at`,
        [commentId, approved]
      );
      
      if (rows.length === 0) return errorResponse('Comment not found', 404);
      return successResponse(rows[0]);
    }

    // POST /blogs/comments/:commentId/reactions
    if (
      event.httpMethod === 'POST' &&
      pathSegments.length === 3 &&
      pathSegments[0] === 'comments' &&
      pathSegments[2] === 'reactions'
    ) {
      const commentId = Number(pathSegments[1]);
      const { type } = JSON.parse(event.body || '{}');
      if (!commentId || !type) return errorResponse('commentId and type are required', 400);

      // Upsert reaction count
      try {
        await query(
          `INSERT INTO comment_reactions (comment_id, type, count)
           VALUES ($1, $2, 1)
           ON CONFLICT (comment_id, type) DO UPDATE SET count = comment_reactions.count + 1`,
          [commentId, String(type)]
        );
      } catch (err) {
        // Fallback if unique constraint doesn't exist
        try {
          const { rows: exists } = await query(
            'SELECT count FROM comment_reactions WHERE comment_id=$1 AND type=$2',
            [commentId, String(type)]
          );
          if (exists.length === 0) {
            await query(
              'INSERT INTO comment_reactions (comment_id, type, count) VALUES ($1, $2, 1)',
              [commentId, String(type)]
            );
          } else {
            await query(
              'UPDATE comment_reactions SET count = count + 1 WHERE comment_id=$1 AND type=$2',
              [commentId, String(type)]
            );
          }
        } catch (err2) {
          console.error('Error updating reactions:', err2);
          return errorResponse('Internal server error', 500);
        }
      }

      // Return full reactions map for the comment
      const { rows: reactions } = await query(
        'SELECT type, count FROM comment_reactions WHERE comment_id=$1',
        [commentId]
      );
      const map = reactions.reduce((acc, r) => {
        acc[r.type] = Number(r.count);
        return acc;
      }, {});
      return successResponse(map);
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in blogs function:', error);
    return errorResponse('Internal server error', 500);
  }
};
