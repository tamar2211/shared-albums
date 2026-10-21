# מדריך API לצד ה-React

המסמך מתאר מה השרת מצפה לקבל ומה הוא מחזיר. אין בו קוד React: את הקומפוננטות, ה-hooks והקריאות כותבים בעצמך.

## כתובת הבסיס (Base URL)

| סביבה | כתובת |
|---|---|
| מקומית | `http://localhost:4000/api` |
| ענן | `https://<שם-השרת>.onrender.com/api` |

כדאי לשמור את הכתובת במשתנה סביבה של Vite (קובץ `.env` בתיקיית הלקוח, משתנה שמתחיל ב-`VITE_`), כדי לעבור בין מקומית לענן בלי לשנות קוד.
כתובת הלקוח חייבת להופיע ב-`CORS_ORIGINS` של השרת, אחרת הדפדפן יחסום את הבקשות.

## התחברות (Authentication)

1. `POST /auth/register` או `POST /auth/login` מחזירים `{ token, user }`.
2. שומרים את ה-`token` בצד הלקוח, ואת `user` כדי להציג את השם.
3. בכל בקשה מוגנת שולחים כותרת:
   ```
   Authorization: Bearer <token>
   ```
4. כשהטוקן לא תקין או שפג תוקפו (7 ימים), כל בקשה מוגנת מחזירה **401**. אז מוחקים את הטוקן ומעבירים לדף ההתחברות.
5. **בטעינת האתר:** אם יש טוקן שמור, `GET /auth/me` בודק שהוא עדיין תקין ומחזיר את המשתמש.
6. **התנתקות:** מוחקים את הטוקן בצד הלקוח. אין לזה כתובת בשרת.

## אילו Endpoints צריך בכל מסך

| מסך | Endpoints |
|---|---|
| דף נחיתה `/` | אין. אם יש טוקן: `GET /auth/me` כדי לדעת אם המשתמש מחובר |
| התחברות / הרשמה `/login` | `POST /auth/login`, `POST /auth/register` |
| פתיחת אלבום חדש `/albums/new` | `POST /albums` |
| האלבומים שלי `/albums` | `GET /albums?search=<טקסט>` |
| אלבום `/albums/:id` | `GET /albums/:albumId`, `GET /albums/:albumId/photos`, `GET /albums/:albumId/photos?liked=true`, `POST /albums/:albumId/photos/check`, `POST /albums/:albumId/photos`, `POST` ו-`DELETE /albums/:albumId/photos/:photoId/like` |
| חלון ניהול (בתוך האלבום, למנהל) | `PUT /albums/:albumId`, `DELETE /albums/:albumId/photos/:photoId`, `DELETE /albums/:albumId` |

## כל ה-Endpoints

| Method | כתובת | גוף הבקשה | תשובה בהצלחה | מי מורשה |
|---|---|---|---|---|
| GET | `/health` | – | 200 `{ ok: true }` | כולם |
| POST | `/auth/register` | `{ name, email, password }` | 201 `{ token, user }` | כולם |
| POST | `/auth/login` | `{ email, password }` | 200 `{ token, user }` | כולם |
| GET | `/auth/me` | – | 200 `{ user }` | מחובר |
| GET | `/albums?search=` | – | 200 `{ owned: Album[], shared: Album[] }` | מחובר |
| POST | `/albums` | AlbumInput | 201 `Album` | מחובר |
| GET | `/albums/:albumId` | – | 200 `Album` (עם memberEmails) | משתתף או מנהל |
| PUT | `/albums/:albumId` | AlbumInput, כל השדות | 200 `Album` | מנהל |
| DELETE | `/albums/:albumId` | – | 204, בלי גוף | מנהל |
| GET | `/albums/:albumId/photos?liked=true` | – | 200 `{ photos: Photo[] }` | משתתף או מנהל |
| POST | `/albums/:albumId/photos/check` | `{ hashes: string[] }` | 200 `{ existing: string[] }` | משתתף או מנהל |
| POST | `/albums/:albumId/photos` | FormData, שדה `photos` (כמה קבצים) | 201 או 200 `UploadResult` | משתתף או מנהל, אלבום פתוח |
| DELETE | `/albums/:albumId/photos/:photoId` | – | 204, בלי גוף | מנהל |
| POST | `/albums/:albumId/photos/:photoId/like` | – | 200 `LikeState` | משתתף או מנהל |
| DELETE | `/albums/:albumId/photos/:photoId/like` | – | 200 `LikeState` | משתתף או מנהל |

## מבני הנתונים

```ts
type User = { id: number; name: string; email: string };

type AlbumStatus = 'open' | 'locked';

type AlbumInput = {
  name: string;               // חובה, 1–100 תווים
  description?: string;       // עד 1000 תווים
  eventDate?: string | null;  // "2026-10-21", או null / ריק
  status?: AlbumStatus;       // ברירת מחדל open
  memberEmails?: string[];    // מיילים תקינים, עד 200
};

type Album = {
  id: number;
  name: string;
  description: string;
  eventDate: string | null;
  status: AlbumStatus;
  ownerId: number;
  ownerName: string;
  role: 'owner' | 'member';   // התפקיד של המשתמש המחובר
  photoCount: number;
  coverUrl: string | null;    // תמונה ממוזערת לשער
  memberEmails?: string[];    // באלבום אחד, ביצירה ובעריכה
  createdAt: string;
  updatedAt: string;
};

type Photo = {
  id: number;
  albumId: number;
  url: string;                // תמונה מלאה: תצוגה מלאה והורדה
  thumbUrl: string;           // 400x400: לגלריה
  width: number | null;
  height: number | null;
  originalName: string;       // שם הקובץ המקורי, טוב לשם הקובץ בהורדה
  uploadedBy: { id: number; name: string } | null;
  uploadedAt: string;
  likeCount: number;
  likedByMe: boolean;
};

type UploadResult = {
  uploaded: Photo[];
  skipped: { name: string; reason: 'duplicate' }[];
  failed: { name: string; reason: string }[];
};

type LikeState = { photoId: number; likeCount: number; likedByMe: boolean };

type ApiError = {
  error: string;                                     // הודעה בעברית להצגה למשתמש
  details?: { field: string; message: string }[];   // רק בשגיאת 400 של ולידציה
};
```

אלה הגדרות טיפוסים בלבד, ולא קוד React. אפשר להעתיק אותן לקובץ `types.ts` בלקוח.

## שדות חובה בטפסים

השרת בודק הכל בעצמו, אבל כדאי שהטופס יבדוק את אותם כללים עם React Hook Form, כדי שהמשתמש יראה שגיאה לפני השליחה.

| טופס | שדה | כלל |
|---|---|---|
| הרשמה | name | חובה, עד 100 תווים |
| הרשמה | email | חובה, מייל תקין |
| הרשמה | password | חובה, 6–100 תווים |
| התחברות | email | חובה, מייל תקין |
| התחברות | password | חובה |
| אלבום | name | חובה, עד 100 תווים |
| אלבום | description | עד 1000 תווים |
| אלבום | eventDate | תאריך בפורמט YYYY-MM-DD, לא חובה |
| אלבום | status | open או locked |
| אלבום | memberEmails | כל מייל תקין, עד 200 |

שגיאת 400 מהשרת מגיעה עם `details`. השדה `field` הוא שם השדה בטופס (`name`, `email`, או `memberEmails.2` למייל השלישי ברשימה), כך שאפשר להציג את ההודעה ליד השדה הנכון.

## העלאת תמונות ומניעת כפולות

הזרימה המומלצת:
1. המשתמש בוחר קבצים.
2. הלקוח מחשב SHA-256 לכל קובץ (בדפדפן יש לזה `crypto.subtle.digest`). זו לוגיקה שאינה React, ולכן מותר להיעזר בה ב-AI.
3. `POST /photos/check` עם רשימת ה-hashes. חוזרים רק אלה שכבר קיימים.
4. מציגים למשתמש "3 תמונות כבר באלבום ידולגו", ושולחים רק את השאר.
5. `POST /photos` עם FormData: כל קובץ נוסף תחת אותו שם שדה, `photos`. לא מגדירים Content-Type ידנית, הדפדפן עושה את זה לבד.
6. התשובה אומרת מה הועלה, מה דולג ומה נכשל. השרת בודק כפולות שוב, גם אם שלב 3 דולג.

מגבלות: עד 30 קבצים בבקשה, עד 10MB לקובץ, קבצי תמונה בלבד.

## קודי שגיאה

| קוד | מתי | מה להציג |
|---|---|---|
| 400 | נתונים לא תקינים, קובץ לא מתאים | את `error`, ואת `details` ליד השדות |
| 401 | לא מחובר, או שפג תוקף הטוקן | להעביר להתחברות |
| 403 | אין הרשאה, או שהאלבום נעול להעלאות | את `error` (למשל "האלבום נעול להעלאות") |
| 404 | האלבום או התמונה לא קיימים | הודעה וקישור חזרה |
| 409 | מייל שכבר רשום | ליד שדה המייל בהרשמה |
| 500 | תקלה בשרת | "משהו השתבש, נסי שוב" |

## הרשאות ומה להציג בממשק

השרת אוכף את כל ההרשאות, אבל הממשק צריך להתאים את עצמו לפי `album.role`:

| מה | `role === 'owner'` | `role === 'member'` |
|---|---|---|
| כפתור "ניהול אלבום" | מוצג | מוסתר |
| מחיקת תמונה | מוצג | מוסתר |
| העלאה | מוצג כש-`status === 'open'` | מוצג כש-`status === 'open'` |
| לייק, הורדה, סינון | מוצג | מוצג |

## דברים שכדאי לדעת

- **הורדה של כמה תמונות כ-ZIP:** נעשית בלקוח. מורידים כל `url` ומכניסים לקובץ ZIP (למשל עם JSZip). זו לוגיקה שאינה React.
- **אחרי שינוי** (יצירה, לייק, העלאה, מחיקה), התשובה מכילה את המצב החדש. אפשר לעדכן ממנה את המסך, או לרענן את הנתונים מהשרת.
- **תאריכים** מגיעים כמחרוזות ISO. `eventDate` הוא תאריך בלבד: `"2026-10-21"`.
- **Swagger** בכתובת `/api-docs` מאפשר לנסות כל קריאה עם דוגמאות, לפני שכותבים אותה בלקוח.
