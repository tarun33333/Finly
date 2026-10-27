import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeName = `${Date.now()}-${randomHex}${ext}`;
    cb(null, safeName);
  },
});

const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, // 8MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      allowedMimes.includes(file.mimetype) ||
      (allowedExtensions.includes(ext) && (file.mimetype === 'application/octet-stream' || !file.mimetype))
    ) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

