import jwt from 'jsonwebtoken';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, disconnect, registerUser, resetDb } from './helpers';

beforeEach(resetDb);
afterAll(disconnect);

describe('הרשמה', () => {
  it('יוצרת משתמש ומחזירה טוקן בלי הסיסמה', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'רחל', email: 'Rachel@Test.Local', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(Number), name: 'רחל', email: 'rachel@test.local' });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain('secret123');
  });

  it('חוסמת מייל שכבר רשום (409)', async () => {
    await registerUser('רחל', 'rachel@test.local');
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'אחרת', email: 'RACHEL@test.local', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  it('מחזירה 400 עם פירוט על נתונים לא תקינים', async () => {
    const res = await api().post('/api/auth/register').send({ name: '', email: 'not-an-email', password: '1' });
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });
});

describe('התחברות', () => {
  beforeEach(async () => {
    await registerUser('רחל', 'rachel@test.local', 'secret123');
  });

  it('מצליחה עם פרטים נכונים', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'rachel@test.local', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('נכשלת עם סיסמה שגויה (401)', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'rachel@test.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it('נכשלת עם מייל שלא קיים (401)', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'nobody@test.local', password: 'secret123' });
    expect(res.status).toBe(401);
  });
});

describe('טוקן', () => {
  it('מחזיר את המשתמש המחובר עם טוקן תקין', async () => {
    const user = await registerUser('רחל', 'rachel@test.local');
    const res = await api().get('/api/auth/me').set(bearer(user));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('rachel@test.local');
  });

  it('מחזיר 401 בלי טוקן', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 עם טוקן לא תקין', async () => {
    const res = await api().get('/api/auth/me').set({ Authorization: 'Bearer not-a-real-token' });
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 עם טוקן שפג תוקפו', async () => {
    const user = await registerUser('רחל', 'rachel@test.local');
    const expired = jwt.sign(
      { sub: String(user.id), exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET as string,
    );
    const res = await api().get('/api/auth/me').set({ Authorization: `Bearer ${expired}` });
    expect(res.status).toBe(401);
  });

  it('מחזיר 401 עם טוקן שנחתם במפתח אחר', async () => {
    const user = await registerUser('רחל', 'rachel@test.local');
    const forged = jwt.sign({ sub: String(user.id) }, 'some-other-secret-that-is-also-long-enough');
    const res = await api().get('/api/auth/me').set({ Authorization: `Bearer ${forged}` });
    expect(res.status).toBe(401);
  });
});
