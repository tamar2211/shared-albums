// יצירה ופענוח של טוקנים (JWT). יש שני סוגים:
// - משתמש רשום: { sub: "<userId>" }
// - משתתף שהצטרף לאלבום דרך קישור: { pid: <participantId>, typ: "participant" }
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/** משתתף שהצטרף דרך קישור נשאר מחובר לאלבום שנה, כדי שלא יצטרך להצטרף שוב */
const PARTICIPANT_TOKEN_SECONDS = 365 * 24 * 60 * 60;

export type TokenPayload = { kind: 'user'; userId: number } | { kind: 'participant'; participantId: number };

export function signUserToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN_SECONDS });
}

export function signParticipantToken(participantId: number): string {
  return jwt.sign({ pid: participantId, typ: 'participant' }, env.JWT_SECRET, { expiresIn: PARTICIPANT_TOKEN_SECONDS });
}

/** מחזיר את תוכן הטוקן, או null אם הוא לא תקין, פג תוקפו או נחתם במפתח אחר */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === 'string') return null;
    if (typeof payload.sub === 'string' && /^\d+$/.test(payload.sub)) {
      return { kind: 'user', userId: Number(payload.sub) };
    }
    if (payload.typ === 'participant' && Number.isInteger(payload.pid)) {
      return { kind: 'participant', participantId: payload.pid as number };
    }
    return null;
  } catch {
    return null;
  }
}

/** הטוקן מתוך הכותרת Authorization: Bearer <token>, או null כשאין */
export function bearerToken(header: string | undefined): string | null {
  const [scheme, token] = (header ?? '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}
