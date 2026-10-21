import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, disconnect, registerUser, resetDb, seedAlbum } from './helpers';

beforeEach(resetDb);
afterAll(disconnect);

describe('יצירת אלבום', () => {
  it('יוצרת אלבום, מנקה מיילים ומסירה את המנהלת מרשימת המשתתפים', async () => {
    const owner = await registerUser('מנהלת', 'owner@test.local');
    const res = await api()
      .post('/api/albums')
      .set(bearer(owner))
      .send({
        name: '  טיול לגליל  ',
        eventDate: '2026-08-03',
        memberEmails: ['B@test.local', 'b@test.local', 'a@test.local', 'OWNER@test.local'],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'טיול לגליל',
      description: '',
      eventDate: '2026-08-03',
      status: 'open',
      role: 'owner',
      photoCount: 0,
      coverUrl: null,
      memberEmails: ['a@test.local', 'b@test.local'],
    });
  });

  it('מחזירה 400 על נתונים לא תקינים', async () => {
    const owner = await registerUser('מנהלת', 'owner@test.local');
    const res = await api()
      .post('/api/albums')
      .set(bearer(owner))
      .send({ name: '', eventDate: '21/10/2026', status: 'archived', memberEmails: ['not-an-email'] });

    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'eventDate', 'status', 'memberEmails.0']));
  });

  it('דורשת התחברות (401)', async () => {
    const res = await api().post('/api/albums').send({ name: 'אלבום' });
    expect(res.status).toBe(401);
  });
});

describe('רשימה וחיפוש', () => {
  it('מפרידה בין אלבומים שפתחתי לאלבומים ששותפו איתי', async () => {
    const { owner, member, outsider, albumId } = await seedAlbum();

    const ownerList = await api().get('/api/albums').set(bearer(owner));
    expect(ownerList.body.owned.map((a: { id: number }) => a.id)).toEqual([albumId]);
    expect(ownerList.body.shared).toEqual([]);

    const memberList = await api().get('/api/albums').set(bearer(member));
    expect(memberList.body.owned).toEqual([]);
    expect(memberList.body.shared.map((a: { id: number }) => a.id)).toEqual([albumId]);
    expect(memberList.body.shared[0].role).toBe('member');

    const outsiderList = await api().get('/api/albums').set(bearer(outsider));
    expect(outsiderList.body).toEqual({ owned: [], shared: [] });
  });

  it('מחפשת לפי חלק מהשם', async () => {
    const owner = await registerUser('מנהלת', 'owner@test.local');
    for (const name of ['בר מצווה של יוסי', 'טיול לגליל', 'Bar Party']) {
      await api().post('/api/albums').set(bearer(owner)).send({ name });
    }

    const hebrew = await api().get('/api/albums').query({ search: 'טיול' }).set(bearer(owner));
    expect(hebrew.body.owned.map((a: { name: string }) => a.name)).toEqual(['טיול לגליל']);

    const caseInsensitive = await api().get('/api/albums').query({ search: 'bar' }).set(bearer(owner));
    expect(caseInsensitive.body.owned.map((a: { name: string }) => a.name)).toEqual(['Bar Party']);

    const none = await api().get('/api/albums').query({ search: 'אין כזה' }).set(bearer(owner));
    expect(none.body.owned).toEqual([]);
  });
});

describe('צפייה באלבום והרשאות', () => {
  it('משתתפת רואה את האלבום עם תפקיד member', async () => {
    const { member, albumId } = await seedAlbum();
    const res = await api().get(`/api/albums/${albumId}`).set(bearer(member));
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('member');
    expect(res.body.memberEmails).toEqual(['member@test.local']);
  });

  it('משתמשת שאינה באלבום מקבלת 403', async () => {
    const { outsider, albumId } = await seedAlbum();
    const res = await api().get(`/api/albums/${albumId}`).set(bearer(outsider));
    expect(res.status).toBe(403);
  });

  it('אלבום שלא קיים מחזיר 404, ומזהה לא תקין מחזיר 400', async () => {
    const { owner } = await seedAlbum();
    expect((await api().get('/api/albums/999999').set(bearer(owner))).status).toBe(404);
    expect((await api().get('/api/albums/abc').set(bearer(owner))).status).toBe(400);
  });
});

describe('עריכה ומחיקה', () => {
  it('משתתפת לא יכולה לערוך או למחוק (403)', async () => {
    const { member, albumId } = await seedAlbum();
    const edit = await api().put(`/api/albums/${albumId}`).set(bearer(member)).send({ name: 'פריצה' });
    expect(edit.status).toBe(403);
    const del = await api().delete(`/api/albums/${albumId}`).set(bearer(member));
    expect(del.status).toBe(403);
  });

  it('המנהלת עורכת, ומשתתפת שהוסרה מאבדת גישה', async () => {
    const { owner, member, albumId } = await seedAlbum();
    const res = await api()
      .put(`/api/albums/${albumId}`)
      .set(bearer(owner))
      .send({ name: 'שם חדש', description: 'עודכן', eventDate: null, status: 'locked', memberEmails: [] });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'שם חדש', description: 'עודכן', eventDate: null, status: 'locked', memberEmails: [] });

    const after = await api().get(`/api/albums/${albumId}`).set(bearer(member));
    expect(after.status).toBe(403);
  });

  it('המנהלת מוחקת את האלבום', async () => {
    const { owner, albumId } = await seedAlbum();
    const del = await api().delete(`/api/albums/${albumId}`).set(bearer(owner));
    expect(del.status).toBe(204);
    const after = await api().get(`/api/albums/${albumId}`).set(bearer(owner));
    expect(after.status).toBe(404);
  });
});
