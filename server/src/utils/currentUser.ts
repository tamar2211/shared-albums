// מי מבצע את הבקשה. נקרא רק בנתיבים שעברו את middleware האימות המתאים.
import type { Request } from 'express';
import type { AuthUser } from '../types/express';
import { unauthorized } from './httpError';

export type Actor = { kind: 'user'; user: AuthUser } | { kind: 'participant'; participantId: number };

/** משתמש רשום בלבד */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}

/** משתמש רשום או משתתף שהצטרף דרך קישור */
export function currentActor(req: Request): Actor {
  if (req.user) return { kind: 'user', user: req.user };
  if (req.participantId !== undefined) return { kind: 'participant', participantId: req.participantId };
  throw unauthorized();
}
