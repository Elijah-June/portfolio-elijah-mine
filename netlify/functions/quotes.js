import { query, successResponse, errorResponse } from './utils/db.js';

function getDayOfYearInTZ(tz) {
  const parts = new Intl.DateTimeFormat('en-CA', { 
    timeZone: tz, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).formatToParts(new Date());
  
  const year = Number(parts.find(p => p.type === 'year').value);
  const month = Number(parts.find(p => p.type === 'month').value);
  const day = Number(parts.find(p => p.type === 'day').value);
  const date = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(Date.UTC(year, 0, 0));
  const diff = date - start;
  return Math.floor(diff / 86400000); // ms per day
}

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { rows } = await query('SELECT id, text, author FROM quotes ORDER BY id ASC');
    if (rows.length === 0) {
      return successResponse(null);
    }
    
    const doy = getDayOfYearInTZ(process.env.TZ || 'UTC');
    const idx = (doy - 1) % rows.length;
    
    return successResponse(rows[idx]);
  } catch (error) {
    console.error('Error in quotes function:', error);
    return errorResponse('Internal server error', 500);
  }
};
