import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/zenora-uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = allowedTypes => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`File type ${file.mimetype} is not allowed`), false);
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: fileFilter(['video/mp4', 'video/webm', 'video/quicktime']),
});

export const uploadFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: fileFilter([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
  ]),
});
