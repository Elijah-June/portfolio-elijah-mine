import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from './utils/db.js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // For Netlify Functions, we'll generate a pre-signed URL for direct upload
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      return errorResponse('Content type must be multipart/form-data', 400);
    }

    const fileExt = contentType.split('/').pop() || 'jpg';
    if (!ALLOWED_TYPES.includes(`image/${fileExt}`)) {
      return errorResponse('Only image files are allowed (JPEG, PNG, GIF, WebP)', 400);
    }

    const key = `${uuidv4()}.${fileExt}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: `image/${fileExt}`,
      ContentLength: event.body ? event.body.length : 0,
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    return successResponse({
      uploadUrl: signedUrl,
      key,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });

  } catch (error) {
    console.error('Error in uploads function:', error);
    return errorResponse('Internal server error', 500);
  }
};
