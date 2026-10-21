// הרשמה והתחברות. הסיסמה נשמרת כ-hash (bcrypt), והתשובה לא כוללת אותה לעולם.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';
import type { AuthUser } from '../types/express';
import { conflict, unauthorized } from '../utils/httpError';

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN_SECONDS });
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw conflict('כבר קיים משתמש עם המייל הזה');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  return { token: signToken(user.id), user };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !valid) {
    throw unauthorized('מייל או סיסמה שגויים');
  }

  return { token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } };
}
