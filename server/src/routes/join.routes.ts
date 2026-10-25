import { Router } from 'express';
import * as join from '../controllers/join.controller';
import { optionalUser } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';

export const joinRouter = Router();

// פתוח לכולם: מי שיש לו את הקישור. משתמש מחובר מצטרף עם החשבון שלו.
joinRouter.get('/:code', asyncHandler(join.info));
joinRouter.post('/:code', optionalUser, asyncHandler(join.join));
