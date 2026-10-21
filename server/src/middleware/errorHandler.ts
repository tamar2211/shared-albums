// טיפול אחיד בשגיאות: כל שגיאה חוזרת כ-{ error: "הודעה" } עם קוד HTTP מתאים.
import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { uploadLimits } from '../config/env';
import { HttpError } from '../utils/httpError';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'הכתובת לא קיימת בשרת' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'הנתונים שנשלחו לא תקינים',
      details: err.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: `קובץ גדול מדי. הגודל המרבי הוא ${uploadLimits.maxFileSizeMb}MB`,
      LIMIT_FILE_COUNT: `אפשר להעלות עד ${uploadLimits.maxFilesPerRequest} תמונות בכל פעם`,
      LIMIT_UNEXPECTED_FILE: `שם השדה צריך להיות photos, ועד ${uploadLimits.maxFilesPerRequest} קבצים`,
    };
    res.status(400).json({ error: messages[err.code] ?? 'שגיאה בהעלאת הקבצים' });
    return;
  }

  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ error: 'גוף הבקשה אינו JSON תקין' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: 'הפריט כבר קיים' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'שגיאה בשרת. נסי שוב בעוד רגע' });
};
