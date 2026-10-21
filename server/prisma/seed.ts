// נתוני הדגמה: שלושה משתמשים, שלושה אלבומים, תמונות ולייקים.
// הרצה: npm run db:seed
//
// התמונות לקוחות מתמונות הדוגמה שמגיעות עם כל חשבון Cloudinary חדש (נופים, אוכל ובעלי חיים),
// כך שלא צריך להעלות קבצים. תמונה שלא קיימת בחשבון מדולגת.
// הסיסמה של משתמשי ההדגמה נלקחת מ-SEED_PASSWORD ולא כתובה בקוד.
import 'dotenv/config';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const password = process.env.SEED_PASSWORD;
if (!password || password.length < 6) {
  console.error('כדי להריץ seed צריך להגדיר SEED_PASSWORD (לפחות 6 תווים) בקובץ .env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const demoUsers = [
  { key: 'owner', name: 'רחל כהן', email: 'rachel.demo@example.com' },
  { key: 'member', name: 'שרה לוי', email: 'sara.demo@example.com' },
  { key: 'outsider', name: 'מרים דוד', email: 'miriam.demo@example.com' },
] as const;

// תמונות דוגמה של Cloudinary, בלי תמונות של אנשים
const samplePhotos = {
  barMitzvah: ['samples/food/dessert', 'samples/food/spices', 'samples/cup-on-a-table', 'samples/coffee'],
  trip: [
    'samples/landscapes/nature-mountains',
    'samples/landscapes/landscape-panorama',
    'samples/landscapes/architecture-signs',
    'samples/animals/reindeer',
    'samples/sheep',
  ],
  classParty: ['samples/animals/cat', 'samples/animals/kitten-playing', 'samples/animals/three-dogs', 'samples/food/fish-vegetables'],
};

async function loadSample(publicId: string) {
  try {
    const resource = await cloudinary.api.resource(publicId);
    const response = await fetch(resource.secure_url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      url: resource.secure_url as string,
      publicId,
      width: (resource.width as number | undefined) ?? null,
      height: (resource.height as number | undefined) ?? null,
      hash: crypto.createHash('sha256').update(buffer).digest('hex'),
      originalName: `${publicId.split('/').pop() ?? 'photo'}.${resource.format as string}`,
    };
  } catch {
    console.warn(`  דילוג: התמונה ${publicId} לא נמצאה בחשבון Cloudinary`);
    return null;
  }
}

async function addPhotos(albumId: number, uploadedById: number, publicIds: string[]) {
  const ids: number[] = [];
  for (const publicId of publicIds) {
    const sample = await loadSample(publicId);
    if (!sample) continue;
    const photo = await prisma.photo.create({ data: { albumId, uploadedById, ...sample } });
    ids.push(photo.id);
  }
  return ids;
}

async function main() {
  console.log('מוחקת נתוני הדגמה קודמים...');
  await prisma.user.deleteMany({ where: { email: { in: demoUsers.map((u) => u.email) } } });

  console.log('יוצרת משתמשים...');
  const passwordHash = await bcrypt.hash(password as string, 10);
  const users: Record<string, { id: number; email: string }> = {};
  for (const user of demoUsers) {
    const created = await prisma.user.create({
      data: { name: user.name, email: user.email, passwordHash },
    });
    users[user.key] = created;
  }
  const owner = users.owner;
  const member = users.member;
  const outsider = users.outsider;

  console.log('יוצרת אלבומים...');
  const barMitzvah = await prisma.album.create({
    data: {
      name: 'בר מצווה של יוסי',
      description: 'כל התמונות מהשמחה, מהבית הכנסת ועד הסעודה',
      eventDate: new Date('2026-09-14T00:00:00.000Z'),
      status: 'open',
      ownerId: owner.id,
      members: { create: [{ email: member.email }] },
    },
  });

  const trip = await prisma.album.create({
    data: {
      name: 'טיול משפחתי לגליל',
      description: 'שלושה ימים בצפון. האלבום נעול להעלאות',
      eventDate: new Date('2026-08-03T00:00:00.000Z'),
      status: 'locked',
      ownerId: owner.id,
      members: { create: [{ email: member.email }, { email: 'family.demo@example.com' }] },
    },
  });

  const classParty = await prisma.album.create({
    data: {
      name: 'מסיבת סיום כיתה ו׳',
      description: 'תמונות מהמסיבה בחצר בית הספר',
      eventDate: new Date('2026-06-25T00:00:00.000Z'),
      status: 'open',
      ownerId: member.id,
      members: { create: [{ email: owner.email }] },
    },
  });

  console.log('מוסיפה תמונות מחשבון Cloudinary...');
  const barPhotos = await addPhotos(barMitzvah.id, owner.id, samplePhotos.barMitzvah);
  const tripPhotos = await addPhotos(trip.id, member.id, samplePhotos.trip);
  const classPhotos = await addPhotos(classParty.id, member.id, samplePhotos.classParty);

  console.log('מוסיפה לייקים...');
  const likes = [
    ...barPhotos.slice(0, 2).map((photoId) => ({ photoId, userId: member.id })),
    ...barPhotos.slice(0, 1).map((photoId) => ({ photoId, userId: owner.id })),
    ...tripPhotos.slice(0, 3).map((photoId) => ({ photoId, userId: owner.id })),
    ...classPhotos.slice(1, 3).map((photoId) => ({ photoId, userId: owner.id })),
  ];
  await prisma.photoLike.createMany({ data: likes, skipDuplicates: true });

  console.log('\nנתוני ההדגמה מוכנים. משתמשים (הסיסמה היא SEED_PASSWORD):');
  console.log(`  ${owner.email}    מנהלת של "בר מצווה" ו"טיול", משתתפת ב"מסיבת סיום"`);
  console.log(`  ${member.email}      משתתפת ב"בר מצווה" ו"טיול", מנהלת של "מסיבת סיום"`);
  console.log(`  ${outsider.email}   לא שייכת לאף אלבום (לבדיקת 403)`);
  console.log(`תמונות שנוספו: ${barPhotos.length + tripPhotos.length + classPhotos.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
