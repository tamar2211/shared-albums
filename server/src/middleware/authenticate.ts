// אימות לפי הכותרת Authorization: Bearer <token>.
// מי שמבצע את הבקשה נקבע לפי הטוקן בלבד, ולא לפי מזהה שהלקוח שולח.
import type { Request } from 'express';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { unauthorized } from '../utils/httpError';
import { bearerToken, verifyToken } from '../utils/tokens';

const INVALID_TOKEN = 'ההתחברות לא תקינה או שפג תוקפה. התחברי מחדש';

async function loadUser(req: Request, userId: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    throw unauthorized('המשתמש לא נמצא. התחברי מחדש');
  }
  req.user = user;
}

/** רק משתמש רשום: אלבומים שלי, יצירת אלבום, ניהול */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = bearerToken(req.headers.authorization);
  if (!token) throw unauthorized();

  const payload = verifyToken(token);
  if (!payload || payload.kind !== 'user') throw unauthorized(INVALID_TOKEN);

  await loadUser(req, payload.userId);
  next();
});

/** משתמש רשום או משתתף שהצטרף דרך קישור: צפייה באלבום, העלאה ולייקים */
export const authenticateUserOrParticipant = asyncHandler(async (req, _res, next) => {
  const token = bearerToken(req.headers.authorization);
  if (!token) throw unauthorized('צריך להתחבר או להצטרף לאלבום דרך הקישור');

  const payload = verifyToken(token);
  if (!payload) throw unauthorized(INVALID_TOKEN);

  if (payload.kind === 'user') {
    await loadUser(req, payload.userId);
  } else {
    req.participantId = payload.participantId;
  }
  next();
});

/** התחברות אופציונלית: אם נשלח טוקן תקין של משתמש רשום, מזהים אותו. אחרת ממשיכים בלי משתמש. */
export const optionalUser = asyncHandler(async (req, _res, next) => {
  const token = bearerToken(req.headers.authorization);
  const payload = token ? verifyToken(token) : null;
  if (payload?.kind === 'user') {
    await loadUser(req, payload.userId);
  }
  next();
});
