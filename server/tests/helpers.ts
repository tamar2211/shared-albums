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
    prisma.albumMember.deleteMany(),
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

export const bearer = (user: TestUser) => ({ Authorization: `Bearer ${user.token}` });

/** שלושה משתמשים: מנהלת, משתתפת וזרה, ואלבום פתוח של המנהלת עם המשתתפת */
export async function seedAlbum(status: 'open' | 'locked' = 'open') {
  const owner = await registerUser('מנהלת', 'owner@test.local');
  const member = await registerUser('משתתפת', 'member@test.local');
  const outsider = await registerUser('זרה', 'outsider@test.local');
  const res = await api()
    .post('/api/albums')
    .set(bearer(owner))
    .send({ name: 'בר מצווה', description: 'תיאור', eventDate: '2026-10-21', status, memberEmails: [member.email] });
  if (res.status !== 201) {
    throw new Error(`create album failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { owner, member, outsider, albumId: res.body.id as number };
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
