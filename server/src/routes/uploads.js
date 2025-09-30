import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import url from 'url';

const router = express.Router();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const name = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('image'), (req, res) => {
  const filename = req.file?.filename;
  if (!filename) return res.status(400).json({ error: 'No file uploaded' });
  // Served statically at /uploads
  const url = `/uploads/${filename}`;
  res.status(201).json({ url });
});

export default router;
