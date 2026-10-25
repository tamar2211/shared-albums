import { Router } from 'express';
import * as albums from '../controllers/album.controller';
import { authenticate, authenticateUserOrParticipant } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { photoRouter } from './photo.routes';

export const albumRouter = Router();

// משתמש רשום בלבד: האלבומים שלי, יצירה, עריכה, מחיקה וניהול
albumRouter.get('/', authenticate, asyncHandler(albums.list));
albumRouter.post('/', authenticate, asyncHandler(albums.create));
albumRouter.put('/:albumId', authenticate, asyncHandler(albums.update));
albumRouter.delete('/:albumId', authenticate, asyncHandler(albums.remove));
albumRouter.post('/:albumId/join-code', authenticate, asyncHandler(albums.regenerateJoinCode));
albumRouter.get('/:albumId/participants', authenticate, asyncHandler(albums.listParticipants));
albumRouter.delete('/:albumId/participants/:participantId', authenticate, asyncHandler(albums.removeParticipant));

// משתמש רשום או משתתף שהצטרף דרך קישור: צפייה, תמונות ולייקים
albumRouter.get('/:albumId', authenticateUserOrParticipant, asyncHandler(albums.getOne));
albumRouter.use('/:albumId/photos', authenticateUserOrParticipant, photoRouter);
