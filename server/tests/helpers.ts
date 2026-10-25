import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';

export const app = createApp();
export const api = () => request(app);

/** מוחק את כל הנתונים במסד הבדיקות */
export async function resetDb() {
  await prisma.$transaction([
    prisma.photoLike.deleteMany(),
    prisma.photo.deleteMany(),
    prisma.participant.deleteMany(),
    prisma.album.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export interface TestUser {
  id: number;
  email: string;
  token: string;
}

export async function registerUser(name: string, email: string, password = 'secret123'): Promise<TestUser> {
  const res = await api().post('/api/auth/register').send({ name, email, password });
  if (res.status !== 201) {
    throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { id: res.body.user.id, email: res.body.user.email, token: res.body.token };
}

/** כל מי שיש לו טוקן: משתמש רשום או אורח שהצטרף דרך קישור */
export const bearer = (who: { token: string }) => ({ Authorization: `Bearer ${who.token}` });

export interface TestGuest {
  participantId: number;
  name: string;
  token: string;
}

/** אורח מצטרף לאלבום דרך הקישור, עם שם לתצוגה */
export async function joinAsGuest(joinCode: string, name: string): Promise<TestGuest> {
  const res = await api().post(`/api/join/${joinCode}`).send({ name });
  if (res.status !== 201) {
    throw new Error(`join failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { participantId: res.body.participant.id, name: res.body.participant.name, token: res.body.token };
}

/**
 * אלבום פתוח של המנהלת. משתתפים:
 * - member: משתמשת רשומה שהצטרפה דרך הקישור עם החשבון שלה
 * - guest: אורח שהצטרף דרך הקישור בלי חשבון
 * - outsider: משתמשת רשומה שלא הצטרפה
 */
export async function seedAlbum(allowUpload = true) {
  const owner = await registerUser('מנהלת', 'owner@test.local');
  const member = await registerUser('משתתפת', 'member@test.local');
  const outsider = await registerUser('זרה', 'outsider@test.local');
  const res = await api()
    .post('/api/albums')
    .set(bearer(owner))
    .send({ name: 'בר מצווה', description: 'תיאור', eventDate: '2026-10-21', allowUpload, category: 'family' });
  if (res.status !== 201) {
    throw new Error(`create album failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const joinCode = res.body.joinCode as string;

  const joined = await api().post(`/api/join/${joinCode}`).set(bearer(member)).send({});
  if (joined.status !== 201) {
    throw new Error(`member join failed: ${joined.status} ${JSON.stringify(joined.body)}`);
  }
  const guest = await joinAsGuest(joinCode, 'אורח');

  return { owner, member, guest, outsider, albumId: res.body.id as number, joinCode };
}

// תמונת PNG בגודל 1x1. variant יוצר קובץ עם תוכן שונה, כלומר hash שונה.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
export const png = (variant = 0) => (variant === 0 ? PNG : Buffer.concat([PNG, Buffer.from(`v${variant}`)]));

export async function disconnect() {
  await prisma.$disconnect();
}
