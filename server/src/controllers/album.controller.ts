import type { Request, Response } from 'express';
import { albumInputSchema, albumListQuerySchema } from '../schemas/album.schema';
import { albumIdParams } from '../schemas/common.schema';
import * as albumService from '../services/album.service';
import { currentUser } from '../utils/currentUser';

export async function list(req: Request, res: Response) {
  const { search } = albumListQuerySchema.parse(req.query);
  res.json(await albumService.listAlbums(currentUser(req), search || undefined));
}

export async function create(req: Request, res: Response) {
  const input = albumInputSchema.parse(req.body);
  res.status(201).json(await albumService.createAlbum(currentUser(req), input));
}

export async function getOne(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  res.json(await albumService.getAlbum(currentUser(req), albumId));
}

export async function update(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  const input = albumInputSchema.parse(req.body);
  res.json(await albumService.updateAlbum(currentUser(req), albumId, input));
}

export async function remove(req: Request, res: Response) {
  const { albumId } = albumIdParams.parse(req.params);
  await albumService.deleteAlbum(currentUser(req), albumId);
  res.status(204).end();
}
