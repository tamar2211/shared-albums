// אימות: בודק את הטוקן בכותרת Authorization: Bearer <token>, ושם את המשתמש ב-req.user.
// המשתמש נקבע לפי הטוקן בלבד, ולא לפי מזהה שהלקוח שולח.
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { unauthorized } from '../utils/httpError';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized();
  }

  let userId: number;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new Error('invalid payload');
    }
    userId = Number(payload.sub);
  } catch {
    throw unauthorized('ההתחברות לא תקינה או שפג תוקפה. התחברי מחדש');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    throw unauthorized('המשתמש לא נמצא. התחברי מחדש');
  }

  req.user = user;
  next();
});
