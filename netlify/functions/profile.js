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
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      },
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/profile', '');
  const pathSegments = path.split('/').filter(Boolean);
  const decoded = verifyAccessTokenFromHeader(event.headers.authorization || '');
  const isAdmin = !!(decoded && decoded.role === 'admin');

  try {
    // GET /profile
    if (event.httpMethod === 'GET' && pathSegments.length === 0) {
      const { rows } = await query(
        `SELECT id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary 
         FROM profile 
         LIMIT 1`
      );
      return successResponse(rows[0] || null);
    }

    // PUT /profile
    if (event.httpMethod === 'PUT' && pathSegments.length === 0) {
      if (!isAdmin) return errorResponse('Unauthorized', 401);
      
      const { 
        display_name, 
        title, 
        bio, 
        avatar_url, 
        social_links, 
        education, 
        expertise, 
        profile_summary 
      } = JSON.parse(event.body || '{}');
      
      const { rows } = await query(
        `INSERT INTO profile (id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE 
         SET display_name=COALESCE($1, profile.display_name),
             title=COALESCE($2, profile.title),
             bio=COALESCE($3, profile.bio),
             avatar_url=COALESCE($4, profile.avatar_url),
             social_links=COALESCE($5, profile.social_links),
             education=COALESCE($6, profile.education),
             expertise=COALESCE($7, profile.expertise),
             profile_summary=COALESCE($8, profile.profile_summary)
         RETURNING id, display_name, title, bio, avatar_url, social_links, education, expertise, profile_summary`,
        [
          display_name,
          title,
          bio,
          avatar_url,
          social_links || {},
          education,
          expertise,
          profile_summary
        ]
      );
      
      return successResponse(rows[0]);
    }

    // Handle unsupported methods or paths
    return errorResponse('Not found', 404);
    
  } catch (error) {
    console.error('Error in profile function:', error);
    return errorResponse('Internal server error', 500);
  }
};
