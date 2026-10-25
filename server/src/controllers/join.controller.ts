import type { Request, Response } from 'express';
import { joinCodeParams, joinInputSchema } from '../schemas/join.schema';
import * as joinService from '../services/join.service';

export async function info(req: Request, res: Response) {
  const { code } = joinCodeParams.parse(req.params);
  res.json(await joinService.getJoinInfo(code));
}

export async function join(req: Request, res: Response) {
  const { code } = joinCodeParams.parse(req.params);
  const { name } = joinInputSchema.parse(req.body ?? {});
  const result = await joinService.joinAlbum(code, name, req.user);
  res.status(201).json(result);
}
