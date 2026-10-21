# Shared Albums – Backend

שרת לאתר האלבומים השיתופיים: Node.js, Express ו-TypeScript, מסד נתונים PostgreSQL דרך Prisma, ואחסון תמונות ב-Cloudinary.

> להעלאה ראשונה לאינטרנט, צעד אחרי צעד: **START-HERE.md**
> לכתיבת צד ה-React מול השרת: **FRONTEND-API-GUIDE.md**
> כל ה-Endpoints עם דוגמאות: **Swagger** בכתובת `/api-docs`

## מבנה הפרויקט

```
src/
  server.ts              נקודת הכניסה: טוען .env, מתחבר למסד ומפעיל את השרת
  app.ts                 הרכבת Express: CORS, JSON, נתיבים, Swagger, שגיאות
  config/env.ts          בדיקת משתני הסביבה (Zod)
  db/prisma.ts           החיבור למסד הנתונים
  routes/                אילו כתובות קיימות ואיזה controller מטפל בכל אחת
  controllers/           קריאת הבקשה, ולידציה, קריאה ל-service והחזרת תשובה
  services/              הלוגיקה: אלבומים, תמונות, הרשאות, התחברות, Cloudinary
  schemas/               סכמות Zod לולידציה של כל קלט
  middleware/            אימות טוקן, העלאת קבצים, טיפול בשגיאות
  utils/                 שגיאות HTTP, עטיפת async, המשתמש המחובר
  docs/swagger.ts        Swagger UI ו-openapi.json
  types/express.ts       req.user
prisma/
  schema.prisma          מבנה הטבלאות
  migrations/            יצירת הטבלאות במסד (SQL)
  seed.ts                נתוני הדגמה
tests/                   בדיקות אוטומטיות (Vitest + Supertest)
docs/openapi.json        תיעוד ה-API בפורמט OpenAPI 3
render.yaml              הגדרות פריסה ל-Render
```

## הרצה מקומית

```bash
npm install          # מתקין תלויות ויוצר את Prisma Client
cp .env.example .env # ואז למלא את הערכים בקובץ .env
npm run db:migrate   # יוצר את הטבלאות במסד
npm run db:seed      # אופציונלי: נתוני הדגמה (דורש SEED_PASSWORD)
npm run dev          # השרת רץ על http://localhost:4000
```

פתחי בדפדפן:
- `http://localhost:4000/api/health` – אמור להחזיר `{"ok":true}`
- `http://localhost:4000/api-docs` – Swagger

## פקודות

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | הרצה מקומית, מתעדכנת בכל שמירה |
| `npm run build` | קומפילציה של TypeScript לתיקייה dist |
| `npm start` | הרצה מתוך dist |
| `npm run start:prod` | מריץ migrations ואז את השרת (ב-Render) |
| `npm run typecheck` | בדיקת טיפוסים בלבד |
| `npm test` | הבדיקות האוטומטיות (דורש TEST_DATABASE_URL) |
| `npm run check` | הכל ברצף: Prisma, typecheck, build ובדיקות |
| `npm run db:migrate` | החלת migrations על המסד |
| `npm run db:seed` | נתוני הדגמה |
| `npm run db:studio` | ממשק גרפי לצפייה בטבלאות |

## משתני סביבה

| משתנה | חובה | תיאור |
|---|---|---|
| `DATABASE_URL` | כן | כתובת החיבור ל-PostgreSQL (Neon) |
| `JWT_SECRET` | כן | מחרוזת סודית של 32 תווים לפחות |
| `JWT_EXPIRES_IN_SECONDS` | לא | תוקף הטוקן. ברירת מחדל 604800 (7 ימים) |
| `CLOUDINARY_CLOUD_NAME` | כן | מ-Cloudinary |
| `CLOUDINARY_API_KEY` | כן | מ-Cloudinary |
| `CLOUDINARY_API_SECRET` | כן | מ-Cloudinary. סודי |
| `CORS_ORIGINS` | לא | כתובות הלקוח, מופרדות בפסיק. ברירת מחדל `http://localhost:5173` |
| `PORT` | לא | ברירת מחדל 4000. ב-Render נקבע אוטומטית |
| `TEST_DATABASE_URL` | לבדיקות | מסד נפרד. הבדיקות מוחקות בו הכל |
| `SEED_PASSWORD` | ל-seed | הסיסמה של משתמשי ההדגמה |

## מסד הנתונים

| טבלה | מה יש בה |
|---|---|
| `User` | משתמשים. הסיסמה נשמרת כ-hash של bcrypt |
| `Album` | אלבומים: שם, תיאור, תאריך, סטטוס (open / locked), מנהל |
| `AlbumMember` | מיילים של משתתפים בכל אלבום |
| `Photo` | תמונות: כתובת ב-Cloudinary, SHA-256 של התוכן, מי העלה |
| `PhotoLike` | לייקים: תמונה + משתמש, אחד לכל זוג |

קשרים: לכל משתמש הרבה אלבומים, לכל אלבום הרבה משתתפים ותמונות, ולייק מחבר תמונה למשתמש. מחיקת אלבום מוחקת את המשתתפים, התמונות והלייקים שלו.

## הרשאות

| פעולה | משתתף | מנהל אלבום |
|---|---|---|
| צפייה באלבום ובתמונות | כן | כן |
| העלאה (רק לאלבום פתוח) | כן | כן |
| לייק וביטול לייק | כן | כן |
| עריכת אלבום, סטטוס ומשתתפים | לא | כן |
| מחיקת תמונה או אלבום | לא | כן |

מי שאינו מנהל ואינו משתתף מקבל 403 על כל פעולה באלבום. בלי טוקן תקין: 401.

## מה לדעת להסביר על השרת

- **לאיזה API ה-React פונה:** לכתובות שמתחילות ב-`/api`, לפי הטבלה ב-FRONTEND-API-GUIDE.md.
- **מה נשלח ומה חוזר:** JSON, חוץ מהעלאת תמונות שנשלחת כ-FormData. שגיאה חוזרת כ-`{ "error": "..." }`.
- **איך נשמר המידע:** ב-PostgreSQL, דרך Prisma. קבצי התמונות ב-Cloudinary, ובמסד רק הכתובת.
- **איך עובדת ההתחברות:** הסיסמה נשמרת כ-hash. בהתחברות השרת מחזיר JWT חתום, והלקוח שולח אותו בכל בקשה בכותרת `Authorization: Bearer`.
- **איך עובדות ההרשאות:** השרת מזהה את המשתמש לפי הטוקן בלבד, ובודק בכל בקשה אם הוא המנהל או משתתף באלבום (`src/services/access.service.ts`).
- **איך נמנעות כפולות:** לכל קובץ מחושב SHA-256. השרת בודק אותו מול האלבום לפני השמירה, ובמסד יש אילוץ ייחודיות על אלבום + hash.
