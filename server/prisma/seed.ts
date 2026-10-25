// נתוני הדגמה: שלושה משתמשים, שלושה אלבומים, משתתפים (רשומים ואורחים), תמונות ולייקים.
// הרצה: npm run db:seed
//
// התמונות לקוחות מתמונות הדוגמה שמגיעות עם כל חשבון Cloudinary חדש (נופים, אוכל ובעלי חיים),
// כך שלא צריך להעלות קבצים. תמונה שלא קיימת בחשבון מדולגת.
// הסיסמה של משתמשי ההדגמה נלקחת מ-SEED_PASSWORD ולא כתובה בקוד.
import 'dotenv/config';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { type AlbumCategory, PrismaClient } from '@prisma/client';

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

const joinCode = () => crypto.randomBytes(12).toString('base64url');

/** אלבום עם המנהל כמשתתף ראשון */
async function createAlbum(
  owner: { id: number; name: string },
  data: { name: string; description: string; eventDate: string; allowUpload: boolean; category: AlbumCategory },
) {
  const album = await prisma.album.create({
    data: {
      ...data,
      eventDate: new Date(`${data.eventDate}T00:00:00.000Z`),
      joinCode: joinCode(),
      ownerId: owner.id,
      participants: { create: { name: owner.name, userId: owner.id, isOwner: true } },
    },
    include: { participants: true },
  });
  return { album, ownerParticipant: album.participants[0] };
}

/** משתתף שהצטרף דרך הקישור: עם חשבון (userId) או אורח (בלי) */
const addParticipant = (albumId: number, name: string, userId: number | null = null) =>
  prisma.participant.create({ data: { albumId, name, userId } });

async function main() {
  console.log('מוחקת נתוני הדגמה קודמים...');
  await prisma.user.deleteMany({ where: { email: { in: demoUsers.map((u) => u.email) } } });

  console.log('יוצרת משתמשים...');
  const passwordHash = await bcrypt.hash(password as string, 10);
  const users: Record<string, { id: number; email: string; name: string }> = {};
  for (const user of demoUsers) {
    const created = await prisma.user.create({
      data: { name: user.name, email: user.email, passwordHash },
    });
    users[user.key] = created;
  }
  const owner = users.owner;
  const member = users.member;
  const outsider = users.outsider;

  console.log('יוצרת אלבומים ומשתתפים...');
  const bar = await createAlbum(owner, {
    name: 'בר מצווה של יוסי',
    description: 'כל התמונות מהשמחה, מהבית הכנסת ועד הסעודה',
    eventDate: '2026-09-14',
    allowUpload: true,
    category: 'family',
  });
  const barMember = await addParticipant(bar.album.id, member.name, member.id);
  const barGuest = await addParticipant(bar.album.id, 'סבתא אסתר');

  const trip = await createAlbum(owner, {
    name: 'טיול משפחתי לגליל',
    description: 'שלושה ימים בצפון. האלבום נעול להעלאות של משתתפים',
    eventDate: '2026-08-03',
    allowUpload: false,
    category: 'trip',
  });
  const tripMember = await addParticipant(trip.album.id, member.name, member.id);
  await addParticipant(trip.album.id, 'דוד משה');

  const classParty = await createAlbum(member, {
    name: 'מסיבת סיום כיתה ו׳',
    description: 'תמונות מהמסיבה בחצר בית הספר',
    eventDate: '2026-06-25',
    allowUpload: true,
    category: 'class',
  });
  const classOwnerJoined = await addParticipant(classParty.album.id, owner.name, owner.id);
  const classGuest = await addParticipant(classParty.album.id, 'נועם');

  console.log('מוסיפה תמונות מחשבון Cloudinary...');
  const barPhotos = [
    ...(await addPhotos(bar.album.id, bar.ownerParticipant.id, samplePhotos.barMitzvah.slice(0, 2))),
    ...(await addPhotos(bar.album.id, barGuest.id, samplePhotos.barMitzvah.slice(2))),
  ];
  const tripPhotos = await addPhotos(trip.album.id, tripMember.id, samplePhotos.trip);
  const classPhotos = [
    ...(await addPhotos(classParty.album.id, classParty.ownerParticipant.id, samplePhotos.classParty.slice(0, 2))),
    ...(await addPhotos(classParty.album.id, classGuest.id, samplePhotos.classParty.slice(2))),
  ];

  console.log('מוסיפה לייקים...');
  const likes = [
    ...barPhotos.slice(0, 2).map((photoId) => ({ photoId, participantId: barMember.id })),
    ...barPhotos.slice(0, 1).map((photoId) => ({ photoId, participantId: barGuest.id })),
    ...tripPhotos.slice(0, 3).map((photoId) => ({ photoId, participantId: trip.ownerParticipant.id })),
    ...classPhotos.slice(1, 3).map((photoId) => ({ photoId, participantId: classOwnerJoined.id })),
  ];
  await prisma.photoLike.createMany({ data: likes, skipDuplicates: true });

  console.log('\nנתוני ההדגמה מוכנים. משתמשים (הסיסמה היא SEED_PASSWORD):');
  console.log(`  ${owner.email}    מנהלת של "בר מצווה" ו"טיול", הצטרפה ל"מסיבת סיום"`);
  console.log(`  ${member.email}      הצטרפה ל"בר מצווה" ו"טיול", מנהלת של "מסיבת סיום"`);
  console.log(`  ${outsider.email}   לא הצטרפה לאף אלבום (לבדיקת 403)`);
  console.log('\nקודי הצטרפות (לבדיקת הצטרפות כאורח, בכתובת /join/<קוד>):');
  console.log(`  בר מצווה:     ${bar.album.joinCode}`);
  console.log(`  טיול:         ${trip.album.joinCode}`);
  console.log(`  מסיבת סיום:   ${classParty.album.joinCode}`);
  console.log(`\nתמונות שנוספו: ${barPhotos.length + tripPhotos.length + classPhotos.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
