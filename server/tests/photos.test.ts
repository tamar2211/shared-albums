import crypto from 'node:crypto';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, disconnect, png, resetDb, seedAlbum } from './helpers';

beforeEach(resetDb);
afterAll(disconnect);

const photosUrl = (albumId: number) => `/api/albums/${albumId}/photos`;

describe('העלאה ומניעת כפולות', () => {
  it('משתתפת מעלה תמונה, ושם קובץ בעברית נשמר', async () => {
    const { member, albumId } = await seedAlbum();
    const res = await api().post(photosUrl(albumId)).set(bearer(member)).attach('photos', png(1), 'תמונה.png');

    expect(res.status).toBe(201);
    expect(res.body.uploaded).toHaveLength(1);
    expect(res.body.uploaded[0]).toMatchObject({
      originalName: 'תמונה.png',
      uploadedBy: { id: member.id, name: 'משתתפת' },
      likeCount: 0,
      likedByMe: false,
    });
  });

  it('תמונה שכבר קיימת באלבום מדולגת', async () => {
    const { owner, member, albumId } = await seedAlbum();
    await api().post(photosUrl(albumId)).set(bearer(member)).attach('photos', png(1), 'a.png');

    const again = await api().post(photosUrl(albumId)).set(bearer(owner)).attach('photos', png(1), 'b.png');
    expect(again.status).toBe(200);
    expect(again.body.uploaded).toHaveLength(0);
    expect(again.body.skipped).toEqual([{ name: 'b.png', reason: 'duplicate' }]);
  });

  it('אותה תמונה פעמיים באותה העלאה נשמרת פעם אחת', async () => {
    const { owner, albumId } = await seedAlbum();
    const res = await api()
      .post(photosUrl(albumId))
      .set(bearer(owner))
      .attach('photos', png(2), 'first.png')
      .attach('photos', png(2), 'second.png')
      .attach('photos', png(3), 'third.png');

    expect(res.status).toBe(201);
    expect(res.body.uploaded.map((p: { originalName: string }) => p.originalName)).toEqual(['first.png', 'third.png']);
    expect(res.body.skipped).toEqual([{ name: 'second.png', reason: 'duplicate' }]);
  });

  it('בדיקת כפולות מראש מחזירה רק את מה שקיים', async () => {
    const { owner, albumId } = await seedAlbum();
    await api().post(photosUrl(albumId)).set(bearer(owner)).attach('photos', png(1), 'a.png');

    const existingHash = crypto.createHash('sha256').update(png(1)).digest('hex');
    const res = await api()
      .post(`${photosUrl(albumId)}/check`)
      .set(bearer(owner))
      .send({ hashes: [existingHash, 'a'.repeat(64)] });

    expect(res.status).toBe(200);
    expect(res.body.existing).toEqual([existingHash]);
  });

  it('קובץ שאינו תמונה נחסם (400), וגם בקשה בלי קבצים', async () => {
    const { owner, albumId } = await seedAlbum();
    const text = await api().post(photosUrl(albumId)).set(bearer(owner)).attach('photos', Buffer.from('hello'), 'notes.txt');
    expect(text.status).toBe(400);
    const empty = await api().post(photosUrl(albumId)).set(bearer(owner));
    expect(empty.status).toBe(400);
  });

  it('אי אפשר להעלות לאלבום נעול (403)', async () => {
    const { owner, member, albumId } = await seedAlbum('locked');
    for (const user of [owner, member]) {
      const res = await api().post(photosUrl(albumId)).set(bearer(user)).attach('photos', png(1), 'a.png');
      expect(res.status).toBe(403);
    }
  });

  it('משתמשת שאינה באלבום לא יכולה להעלות או לצפות (403)', async () => {
    const { outsider, albumId } = await seedAlbum();
    expect((await api().post(photosUrl(albumId)).set(bearer(outsider)).attach('photos', png(1), 'a.png')).status).toBe(403);
    expect((await api().get(photosUrl(albumId)).set(bearer(outsider))).status).toBe(403);
  });
});

describe('לייקים וסינון', () => {
  async function albumWithPhotos() {
    const ctx = await seedAlbum();
    const res = await api()
      .post(photosUrl(ctx.albumId))
      .set(bearer(ctx.owner))
      .attach('photos', png(1), 'one.png')
      .attach('photos', png(2), 'two.png')
      .attach('photos', png(3), 'three.png');
    const ids = res.body.uploaded.map((p: { id: number }) => p.id) as number[];
    return { ...ctx, ids };
  }

  it('לייק, לייק כפול שלא נספר, וביטול', async () => {
    const { member, albumId, ids } = await albumWithPhotos();
    const likeUrl = `${photosUrl(albumId)}/${ids[0]}/like`;

    const first = await api().post(likeUrl).set(bearer(member));
    expect(first.body).toEqual({ photoId: ids[0], likeCount: 1, likedByMe: true });

    const second = await api().post(likeUrl).set(bearer(member));
    expect(second.body.likeCount).toBe(1);

    const unlike = await api().delete(likeUrl).set(bearer(member));
    expect(unlike.body).toEqual({ photoId: ids[0], likeCount: 0, likedByMe: false });
  });

  it('liked=true מחזיר רק תמונות עם לייקים, לפי מספר הלייקים', async () => {
    const { owner, member, albumId, ids } = await albumWithPhotos();
    await api().post(`${photosUrl(albumId)}/${ids[1]}/like`).set(bearer(owner));
    await api().post(`${photosUrl(albumId)}/${ids[1]}/like`).set(bearer(member));
    await api().post(`${photosUrl(albumId)}/${ids[2]}/like`).set(bearer(member));

    const all = await api().get(photosUrl(albumId)).set(bearer(member));
    expect(all.body.photos).toHaveLength(3);

    const liked = await api().get(photosUrl(albumId)).query({ liked: 'true' }).set(bearer(member));
    expect(liked.body.photos.map((p: { id: number; likeCount: number }) => [p.id, p.likeCount])).toEqual([
      [ids[1], 2],
      [ids[2], 1],
    ]);
    expect(liked.body.photos[0].likedByMe).toBe(true);
  });

  it('אפשר לסמן לייק גם באלבום נעול', async () => {
    const { owner, member, albumId, ids } = await albumWithPhotos();
    await api()
      .put(`/api/albums/${albumId}`)
      .set(bearer(owner))
      .send({ name: 'בר מצווה', status: 'locked', memberEmails: [member.email] });

    const res = await api().post(`${photosUrl(albumId)}/${ids[0]}/like`).set(bearer(member));
    expect(res.status).toBe(200);
  });

  it('תמונה מאלבום אחר מחזירה 404', async () => {
    const { owner, albumId, ids } = await albumWithPhotos();
    const other = await api().post('/api/albums').set(bearer(owner)).send({ name: 'אלבום אחר' });
    const res = await api().post(`${photosUrl(other.body.id)}/${ids[0]}/like`).set(bearer(owner));
    expect(res.status).toBe(404);
    expect(albumId).not.toBe(other.body.id);
  });
});

describe('מחיקת תמונה', () => {
  it('רק המנהלת יכולה למחוק', async () => {
    const { owner, member, albumId } = await seedAlbum();
    const up = await api().post(photosUrl(albumId)).set(bearer(member)).attach('photos', png(1), 'a.png');
    const photoUrl = `${photosUrl(albumId)}/${up.body.uploaded[0].id}`;

    expect((await api().delete(photoUrl).set(bearer(member))).status).toBe(403);
    expect((await api().delete(photoUrl).set(bearer(owner))).status).toBe(204);

    const list = await api().get(photosUrl(albumId)).set(bearer(owner));
    expect(list.body.photos).toEqual([]);
  });
});
