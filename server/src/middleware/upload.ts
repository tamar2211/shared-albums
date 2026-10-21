// קבלת קבצי תמונה מהלקוח (multipart/form-data). הקבצים נשמרים בזיכרון עד ההעלאה ל-Cloudinary.
import multer from 'multer';
import { uploadLimits } from '../config/env';
import { badRequest } from '../utils/httpError';

export const uploadPhotos = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: uploadLimits.maxFileSizeMb * 1024 * 1024,
    files: uploadLimits.maxFilesPerRequest,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(badRequest('אפשר להעלות רק קבצי תמונה'));
    }
  },
}).array('photos', uploadLimits.maxFilesPerRequest);
