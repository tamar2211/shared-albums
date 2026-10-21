import { Router } from 'express';
import * as albums from '../controllers/album.controller';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../utils/asyncHandler';
import { photoRouter } from './photo.routes';

export const albumRouter = Router();

// כל נתיבי האלבומים והתמונות דורשים התחברות
albumRouter.use(authenticate);

albumRouter.get('/', asyncHandler(albums.list));
albumRouter.post('/', asyncHandler(albums.create));
albumRouter.get('/:albumId', asyncHandler(albums.getOne));
albumRouter.put('/:albumId', asyncHandler(albums.update));
albumRouter.delete('/:albumId', asyncHandler(albums.remove));

albumRouter.use('/:albumId/photos', photoRouter);
