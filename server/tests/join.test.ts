import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, disconnect, joinAsGuest, png, registerUser, resetDb, seedAlbum } from './helpers';

beforeEach(resetDb);
afterAll(disconnect);

describe('דף ההצטרפות', () => {
  it('מחזיר את פרטי האלבום לפי הקוד, בלי התחברות', async () => {
    const { albumId, joinCode } = await seedAlbum();
    const res = await api().get(`/api/join/${joinCode}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      albumId,
      name: 'בר מצווה',
      ownerName: 'מנהלת',
      eventDate: '2026-10-21',
      allowUpload: true,
      photoCount: 0,
      coverUrl: null,
    });
  });

  it('קוד שלא קיים מחזיר 404', async () => {
    const res = await api().get('/api/join/no-such-code');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });
});

describe('הצטרפות כאורח', () => {
  it('אורח כותב שם, מקבל טוקן, ונכנס לאלבום כמשתתף', async () => {
    const { albumId, joinCode } = await seedAlbum();
    const res = await api().post(`/api/join/${joinCode}`).send({ name: '  יעקב  ' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ albumId, participant: { name: 'יעקב' }, token: expect.any(String) });

    const album = await api().get(`/api/albums/${albumId}`).set(bearer(res.body));
    expect(album.status).toBe(200);
    expect(album.body).toMatchObject({ role: 'member', me: { participantId: res.body.participant.id, name: 'יעקב' } });
  });

  it('אורח בלי שם מקבל 400', async () => {
    const { joinCode } = await seedAlbum();
    const empty = await api().post(`/api/join/${joinCode}`).send({});
    expect(empty.status).toBe(400);
    const blank = await api().post(`/api/join/${joinCode}`).send({ name: '   ' });
    expect(blank.status).toBe(400);
  });

  it('אורח מעלה תמונה, והשם שלו מופיע ליד התמונה', async () => {
    const { guest, albumId } = await seedAlbum();
    const res = await api()
      .post(`/api/albums/${albumId}/photos`)
      .set(bearer(guest))
      .attach('photos', png(1), 'a.png');

    expect(res.status).toBe(201);
    expect(res.body.uploaded[0].uploadedBy).toEqual({ id: guest.participantId, name: 'אורח' });
  });

  it('לכל אורח לייק אחד משלו', async () => {
    const { owner, guest, albumId, joinCode } = await seedAlbum();
    const up = await api().post(`/api/albums/${albumId}/photos`).set(bearer(owner)).attach('photos', png(1), 'a.png');
    const likeUrl = `/api/albums/${albumId}/photos/${up.body.uploaded[0].id}/like`;
    const second = await joinAsGuest(joinCode, 'אורחת שנייה');

    await api().post(likeUrl).set(bearer(guest));
    await api().post(likeUrl).set(bearer(guest));
    const res = await api().post(likeUrl).set(bearer(second));
    expect(res.body).toEqual({ photoId: up.body.uploaded[0].id, likeCount: 2, likedByMe: true });
  });

  it('טוקן של אורח עובד רק באלבום שלו', async () => {
    const { owner, guest } = await seedAlbum();
    const other = await api().post('/api/albums').set(bearer(owner)).send({ name: 'אלבום אחר' });
    const res = await api().get(`/api/albums/${other.body.id}`).set(bearer(guest));
    expect(res.status).toBe(403);
  });

  it('אורח לא יכול לערוך, למחוק או לנהל (401)', async () => {
    const { guest, albumId } = await seedAlbum();
    expect((await api().put(`/api/albums/${albumId}`).set(bearer(guest)).send({ name: 'x' })).status).toBe(401);
    expect((await api().delete(`/api/albums/${albumId}`).set(bearer(guest))).status).toBe(401);
    expect((await api().get(`/api/albums/${albumId}/participants`).set(bearer(guest))).status).toBe(401);
    expect((await api().get('/api/albums').set(bearer(guest))).status).toBe(401);
    expect((await api().get('/api/auth/me').set(bearer(guest))).status).toBe(401);
  });

  it('אורח לא יכול למחוק תמונה (403)', async () => {
    const { guest, albumId } = await seedAlbum();
    const up = await api().post(`/api/albums/${albumId}/photos`).set(bearer(guest)).attach('photos', png(1), 'a.png');
    const res = await api().delete(`/api/albums/${albumId}/photos/${up.body.uploaded[0].id}`).set(bearer(guest));
    expect(res.status).toBe(403);
  });
});

describe('הצטרפות עם חשבון', () => {
  it('משתמשת מחוברת מצטרפת עם השם שלה, והצטרפות חוזרת לא יוצרת משתתף כפול', async () => {
    const { owner, albumId, joinCode } = await seedAlbum();
    const user = await registerUser('דבורה', 'dvora@test.local');

    const first = await api().post(`/api/join/${joinCode}`).set(bearer(user)).send({});
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ albumId, participant: { name: 'דבורה' }, token: null });

    const again = await api().post(`/api/join/${joinCode}`).set(bearer(user)).send({});
    expect(again.body.participant.id).toBe(first.body.participant.id);

    const list = await api().get(`/api/albums/${albumId}/participants`).set(bearer(owner));
    expect(list.body.participants.filter((p: { name: string }) => p.name === 'דבורה')).toHaveLength(1);
  });

  it('המנהלת שנכנסת דרך הקישור נשארת מנהלת', async () => {
    const { owner, joinCode } = await seedAlbum();
    const res = await api().post(`/api/join/${joinCode}`).set(bearer(owner)).send({});
    expect(res.status).toBe(201);
    expect(res.body.token).toBeNull();
  });
});

describe('ניהול משתתפים וקישור', () => {
  it('המנהלת רואה את רשימת המשתתפים', async () => {
    const { owner, albumId } = await seedAlbum();
    const res = await api().get(`/api/albums/${albumId}/participants`).set(bearer(owner));
    expect(res.status).toBe(200);
    expect(
      res.body.participants.map((p: { name: string; isOwner: boolean; registered: boolean }) => [
        p.name,
        p.isOwner,
        p.registered,
      ]),
    ).toEqual([
      ['מנהלת', true, true],
      ['משתתפת', false, true],
      ['אורח', false, false],
    ]);
  });

  it('משתתפת לא רואה את רשימת המשתתפים (403)', async () => {
    const { member, albumId } = await seedAlbum();
    const res = await api().get(`/api/albums/${albumId}/participants`).set(bearer(member));
    expect(res.status).toBe(403);
  });

  it('הסרת משתתף חוסמת את הגישה שלו, והתמונות שלו נשארות', async () => {
    const { owner, guest, albumId } = await seedAlbum();
    await api().post(`/api/albums/${albumId}/photos`).set(bearer(guest)).attach('photos', png(1), 'a.png');

    const del = await api().delete(`/api/albums/${albumId}/participants/${guest.participantId}`).set(bearer(owner));
    expect(del.status).toBe(204);

    const after = await api().get(`/api/albums/${albumId}`).set(bearer(guest));
    expect(after.status).toBe(403);

    const photos = await api().get(`/api/albums/${albumId}/photos`).set(bearer(owner));
    expect(photos.body.photos[0].uploadedBy.name).toBe('אורח');

    const list = await api().get(`/api/albums/${albumId}/participants`).set(bearer(owner));
    expect(list.body.participants.map((p: { name: string }) => p.name)).not.toContain('אורח');
  });

  it('משתמשת רשומה שהוסרה לא יכולה להצטרף שוב עם החשבון', async () => {
    const { owner, member, albumId, joinCode } = await seedAlbum();
    const list = await api().get(`/api/albums/${albumId}/participants`).set(bearer(owner));
    const memberId = list.body.participants.find((p: { name: string }) => p.name === 'משתתפת').id;
    await api().delete(`/api/albums/${albumId}/participants/${memberId}`).set(bearer(owner));

    const rejoin = await api().post(`/api/join/${joinCode}`).set(bearer(member)).send({});
    expect(rejoin.status).toBe(403);
    const shared = await api().get('/api/albums').set(bearer(member));
    expect(shared.body.shared).toEqual([]);
  });

  it('אי אפשר להסיר את המנהלת (400), ומשתתף שלא קיים מחזיר 404', async () => {
    const { owner, albumId } = await seedAlbum();
    const list = await api().get(`/api/albums/${albumId}/participants`).set(bearer(owner));
    const ownerId = list.body.participants[0].id;
    expect((await api().delete(`/api/albums/${albumId}/participants/${ownerId}`).set(bearer(owner))).status).toBe(400);
    expect((await api().delete(`/api/albums/${albumId}/participants/999999`).set(bearer(owner))).status).toBe(404);
  });

  it('קישור חדש מבטל את הישן, ומי שכבר הצטרף נשאר', async () => {
    const { owner, guest, albumId, joinCode } = await seedAlbum();
    const res = await api().post(`/api/albums/${albumId}/join-code`).set(bearer(owner));
    expect(res.status).toBe(200);
    expect(res.body.joinCode).not.toBe(joinCode);

    expect((await api().get(`/api/join/${joinCode}`)).status).toBe(404);
    expect((await api().post(`/api/join/${joinCode}`).send({ name: 'מאוחר' })).status).toBe(404);
    expect((await api().get(`/api/join/${res.body.joinCode}`)).status).toBe(200);
    expect((await api().get(`/api/albums/${albumId}`).set(bearer(guest))).status).toBe(200);
  });

  it('רק המנהלת יכולה ליצור קישור חדש (403)', async () => {
    const { member, albumId } = await seedAlbum();
    const res = await api().post(`/api/albums/${albumId}/join-code`).set(bearer(member));
    expect(res.status).toBe(403);
  });
});
