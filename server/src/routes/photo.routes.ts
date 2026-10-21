import { Router } from 'express';
import * as photos from '../controllers/photo.controller';
import { uploadPhotos } from '../middleware/upload';
import { asyncHandler } from '../utils/asyncHandler';

// mergeParams: כדי לקבל את :albumId מהנתיב של האלבומים
export const photoRouter = Router({ mergeParams: true });

photoRouter.get('/', asyncHandler(photos.list));
photoRouter.post('/check', asyncHandler(photos.checkHashes));
photoRouter.post('/', uploadPhotos, asyncHandler(photos.upload));
photoRouter.delete('/:photoId', asyncHandler(photos.remove));
photoRouter.post('/:photoId/like', asyncHandler(photos.like));
photoRouter.delete('/:photoId/like', asyncHandler(photos.unlike));
