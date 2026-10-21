// מחזיר את המשתמש המחובר. נקרא רק בנתיבים שעברו את authenticate.
import type { Request } from 'express';
import type { AuthUser } from '../types/express';
import { unauthorized } from './httpError';

export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}
