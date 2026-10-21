import type { Request, Response } from 'express';
import { albumIdParams, photoIdParams } from '../schemas/common.schema';
import { checkHashesSchema, photoListQuerySchema } from '../schemas/photo.schema';
import * as photoService from '../services/photo.service';
import { currentUser } from '../utils/currentUser';

export async function list(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  const { liked } = photoListQuerySchema.parse(req.query);
  res.json({ photos: await photoService.listPhotos(currentUser(req), albumId, liked) });
}

export async function checkHashes(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  const { hashes } = checkHashesSchema.parse(req.body);
  res.json({ existing: await photoService.findExistingHashes(currentUser(req), albumId, hashes) });
}

export async function upload(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const result = await photoService.uploadPhotos(currentUser(req), albumId, files);
  res.status(result.uploaded.length > 0 ? 201 : 200).json(result);
}

export async function remove(req: Request, res: Response) {
  const { albumId, photoId } = photoIdParams.parse(req.params);
  await photoService.deletePhoto(currentUser(req), albumId, photoId);
  res.status(204).end();
}

export async function like(req: Request, res: Response) {
  const { albumId, photoId } = photoIdParams.parse(req.params);
  res.json(await photoService.likePhoto(currentUser(req), albumId, photoId));
}

export async function unlike(req: Request, res: Response) {
  const { albumId, photoId } = photoIdParams.parse(req.params);
  res.json(await photoService.unlikePhoto(currentUser(req), albumId, photoId));
}
