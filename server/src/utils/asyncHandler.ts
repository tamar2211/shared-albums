// Express 4 לא תופס שגיאות בפונקציות async. העטיפה מעבירה אותן ל-errorHandler.
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
