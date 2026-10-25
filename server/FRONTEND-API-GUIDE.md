# מדריך API לצד ה-React

המסמך מתאר מה השרת מצפה לקבל ומה הוא מחזיר. אין בו קוד React: את הקומפוננטות, ה-hooks והקריאות כותבים בעצמך.

## כתובת הבסיס (Base URL)

| סביבה | כתובת |
|---|---|
| מקומית | `http://localhost:4000/api` |
| ענן | `https://shared-albums.onrender.com/api` |

כדאי לשמור את הכתובת במשתנה סביבה של Vite (קובץ `.env` בתיקיית הלקוח, משתנה שמתחיל ב-`VITE_`), כדי לעבור בין מקומית לענן בלי לשנות קוד.
כתובת הלקוח חייבת להופיע ב-`CORS_ORIGINS` של השרת, אחרת הדפדפן יחסום את הבקשות.

## שני סוגי משתמשים

| | משתמש רשום | משתתף שהצטרף דרך קישור (אורח) |
|---|---|---|
| איך נכנס | הרשמה / התחברות עם מייל וסיסמה | פותח את קישור ההצטרפות וכותב שם לתצוגה |
| הטוקן | `token` מ-register / login | `token` מ-`POST /join/:code` |
| תוקף | 7 ימים | שנה |
| עובד ב | כל האלבומים שלו | רק באלבום שהצטרף אליו |
| מה מותר | הכל, כולל פתיחת אלבומים וניהול | צפייה, העלאה (כשהאלבום פתוח), לייקים, הורדה |

בשני המקרים שולחים את הטוקן באותה כותרת:
```
Authorization: Bearer <token>
```

## התחברות של משתמש רשום

1. `POST /auth/register` או `POST /auth/login` מחזירים `{ token, user }`.
2. שומרים את ה-`token` בצד הלקוח, ואת `user` כדי להציג את השם.
3. כשהטוקן לא תקין או שפג תוקפו, כל בקשה מוגנת מחזירה **401**. אז מוחקים את הטוקן ומעבירים לדף ההתחברות.
4. **בטעינת האתר:** אם יש טוקן שמור, `GET /auth/me` בודק שהוא עדיין תקין ומחזיר את המשתמש.
5. **התנתקות:** מוחקים את הטוקן בצד הלקוח. אין לזה כתובת בשרת.

## הצטרפות דרך קישור

**הקישור** בנוי בלקוח: `<כתובת האתר>/join/<joinCode>`. את `joinCode` המנהל מקבל בתוך האלבום. כדאי לבנות את הכתובת מ-`window.location.origin`, כך שהיא נכונה גם מקומית וגם בענן.

**הזרימה בדף `/join/:code`:**
1. `GET /join/:code` מחזיר את שם האלבום, מי פתח אותו ותמונת שער, כדי להציג "הוזמנת לאלבום ...". אם חוזר 404, הקישור לא תקין או שהוחלף.
2. **אם המשתמש מחובר לחשבון:** `POST /join/:code` עם הטוקן שלו וגוף ריק. התשובה כוללת `token: null`, והוא ממשיך עם הטוקן שלו. האלבום יופיע אצלו ב"אלבומים ששותפו איתי".
3. **אם לא מחובר:** טופס עם שדה אחד, שם לתצוגה. `POST /join/:code` עם `{ name }`. מהתשובה שומרים את `token` ואת `albumId`.
4. מעבירים ל-`/albums/:albumId`.

**איזה טוקן לשלוח בבקשות של אלבום:** אם המשתמש מחובר לחשבון, את הטוקן של החשבון. אחרת, את טוקן המשתתף של האלבום הזה. מאחר שלאורח יכולים להיות טוקנים לכמה אלבומים, כדאי לשמור אותם לפי `albumId` (למשל אובייקט `{ [albumId]: token }`).

**אורח שחוזר עם אותו דפדפן** לא צריך להצטרף שוב: אם יש טוקן שמור לאלבום, נכנסים ישר.

## אילו Endpoints צריך בכל מסך

| מסך | Endpoints |
|---|---|
| דף נחיתה `/` | אין. אם יש טוקן: `GET /auth/me` כדי לדעת אם המשתמש מחובר |
| התחברות / הרשמה `/login` | `POST /auth/login`, `POST /auth/register` |
| הצטרפות `/join/:code` | `GET /join/:code`, `POST /join/:code` |
| פתיחת אלבום חדש `/albums/new` | `POST /albums` |
| האלבומים שלי `/albums` | `GET /albums?search=<טקסט>` |
| אלבום `/albums/:id` | `GET /albums/:albumId`, `GET /albums/:albumId/photos`, `GET /albums/:albumId/photos?liked=true`, `POST /albums/:albumId/photos/check`, `POST /albums/:albumId/photos`, `POST` ו-`DELETE /albums/:albumId/photos/:photoId/like` |
| ניהול (בתוך האלבום, למנהל) | `PUT /albums/:albumId`, `POST /albums/:albumId/join-code`, `GET /albums/:albumId/participants`, `DELETE /albums/:albumId/participants/:participantId`, `DELETE /albums/:albumId/photos/:photoId`, `DELETE /albums/:albumId` |

## כל ה-Endpoints

| Method | כתובת | גוף הבקשה | תשובה בהצלחה | מי מורשה |
|---|---|---|---|---|
| GET | `/health` | – | 200 `{ ok: true }` | כולם |
| POST | `/auth/register` | `{ name, email, password }` | 201 `{ token, user }` | כולם |
| POST | `/auth/login` | `{ email, password }` | 200 `{ token, user }` | כולם |
| GET | `/auth/me` | – | 200 `{ user }` | משתמש רשום |
| GET | `/join/:code` | – | 200 `JoinInfo` | כולם |
| POST | `/join/:code` | `{ name }` (לאורח) | 201 `JoinResult` | כולם |
| GET | `/albums?search=` | – | 200 `{ owned: Album[], shared: Album[] }` | משתמש רשום |
| POST | `/albums` | AlbumInput | 201 `Album` | משתמש רשום |
| GET | `/albums/:albumId` | – | 200 `Album` | משתתף או מנהל |
| PUT | `/albums/:albumId` | AlbumInput, כל השדות | 200 `Album` | מנהל |
| DELETE | `/albums/:albumId` | – | 204, בלי גוף | מנהל |
| POST | `/albums/:albumId/join-code` | – | 200 `{ joinCode }` | מנהל |
| GET | `/albums/:albumId/participants` | – | 200 `{ participants: Participant[] }` | מנהל |
| DELETE | `/albums/:albumId/participants/:participantId` | – | 204, בלי גוף | מנהל |
| GET | `/albums/:albumId/photos?liked=true` | – | 200 `{ photos: Photo[] }` | משתתף או מנהל |
| POST | `/albums/:albumId/photos/check` | `{ hashes: string[] }` | 200 `{ existing: string[] }` | משתתף או מנהל |
| POST | `/albums/:albumId/photos` | FormData, שדה `photos` (כמה קבצים) | 201 או 200 `UploadResult` | משתתף או מנהל, אלבום פתוח |
| DELETE | `/albums/:albumId/photos/:photoId` | – | 204, בלי גוף | מנהל |
| POST | `/albums/:albumId/photos/:photoId/like` | – | 200 `LikeState` | משתתף או מנהל |
| DELETE | `/albums/:albumId/photos/:photoId/like` | – | 200 `LikeState` | משתתף או מנהל |

"משתתף" = משתמש רשום שהצטרף דרך הקישור, או אורח עם טוקן משתתף של האלבום הזה.

## מבני הנתונים

```ts
type User = { id: number; name: string; email: string };

type AlbumCategory = 'family' | 'trip' | 'class' | 'other';

type AlbumInput = {
  name: string;               // חובה, 1–100 תווים
  description?: string;       // עד 1000 תווים
  eventDate?: string | null;  // "2026-10-21", או null / ריק
  category?: AlbumCategory;   // ברירת מחדל other
  allowDownload?: boolean;    // ברירת מחדל true. כשכבוי, משתתפים לא יכולים להוריד
  allowUpload?: boolean;      // ברירת מחדל true. כשכבוי, משתתפים לא יכולים להעלות
};

type Album = {
  id: number;
  name: string;
  description: string;
  eventDate: string | null;
  category: AlbumCategory;
  allowDownload: boolean;     // ההגדרה של האלבום
  canDownload: boolean;       // האם אני יכול להוריד: לפי זה מציגים את כפתורי ההורדה
  allowUpload: boolean;       // ההגדרה של האלבום
  canUpload: boolean;         // האם אני יכול להעלות: לפי זה מציגים את כפתור ההעלאה
  ownerId: number;
  ownerName: string;
  role: 'owner' | 'member';   // התפקיד של מי שמבצע את הבקשה
  photoCount: number;
  participantCount: number;   // משתתפים פעילים, כולל המנהל
  coverUrl: string | null;    // תמונה ממוזערת לשער
  joinCode?: string;          // רק למנהל: הקוד לקישור ההצטרפות
  me?: { participantId: number; name: string }; // מי אני באלבום (באלבום אחד, ביצירה ובעריכה)
  createdAt: string;
  updatedAt: string;
};

type Participant = {
  id: number;
  name: string;               // שם לתצוגה
  isOwner: boolean;
  registered: boolean;        // true = משתמש רשום, false = אורח
  photoCount: number;
  joinedAt: string;
};

type JoinInfo = {
  albumId: number;
  name: string;
  ownerName: string;
  eventDate: string | null;
  allowUpload: boolean;       // האם משתתפים יכולים להעלות
  photoCount: number;
  coverUrl: string | null;
};

type JoinResult = {
  albumId: number;
  participant: { id: number; name: string };
  token: string | null;       // לאורח: טוקן משתתף. למשתמש מחובר: null
};

type Photo = {
  id: number;
  albumId: number;
  url: string;                // תמונה מלאה: תצוגה מלאה והורדה. כש-canDownload כבוי: גרסת צפייה מוקטנת
  thumbUrl: string;           // 400x400: לגלריה
  width: number | null;
  height: number | null;
  originalName: string;       // שם הקובץ המקורי, טוב לשם הקובץ בהורדה
  uploadedBy: { id: number; name: string } | null; // id = מזהה המשתתף
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
| הצטרפות | name | חובה לאורח, עד 50 תווים |
| אלבום | name | חובה, עד 100 תווים |
| אלבום | description | עד 1000 תווים |
| אלבום | eventDate | תאריך בפורמט YYYY-MM-DD, לא חובה |
| אלבום | category | family, trip, class או other (שדה בחירה) |
| אלבום | allowDownload | true / false (תיבת סימון: "משתתפים יכולים להוריד תמונות") |
| אלבום | allowUpload | true / false (תיבת סימון: "משתתפים יכולים להעלות תמונות") |

שגיאת 400 מהשרת מגיעה עם `details`. השדה `field` הוא שם השדה בטופס, כך שאפשר להציג את ההודעה ליד השדה הנכון.

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
| 400 | נתונים לא תקינים, קובץ לא מתאים, אורח בלי שם | את `error`, ואת `details` ליד השדות |
| 401 | לא מחובר, פג תוקף הטוקן, או טוקן של אורח בנתיב שדורש חשבון | להעביר להתחברות (או לדף ההצטרפות, אם זה אורח) |
| 403 | אין הרשאה, המשתתף הוסר מהאלבום, או שמשתתף מנסה להעלות כשההעלאה כבויה | את `error` (למשל "האלבום נעול להעלאות") |
| 404 | האלבום, התמונה או המשתתף לא קיימים, או קישור הצטרפות לא תקין | הודעה וקישור חזרה |
| 409 | מייל שכבר רשום | ליד שדה המייל בהרשמה |
| 500 | תקלה בשרת | "משהו השתבש, נסי שוב" |

## הרשאות ומה להציג בממשק

השרת אוכף את כל ההרשאות, אבל הממשק צריך להתאים את עצמו לפי `album.role`:

| מה | `role === 'owner'` | `role === 'member'` |
|---|---|---|
| כפתור "ניהול אלבום" | מוצג | מוסתר |
| "העתק קישור הצטרפות" ו"קישור חדש" | מוצג | מוסתר |
| רשימת משתתפים והסרה | מוצג | מוסתר |
| מחיקת תמונה | מוצג | מוסתר |
| העלאה | מוצג | מוצג כש-`canUpload` |
| בחירה והורדה (כולל ZIP) | מוצג | מוצג כש-`canDownload` |
| לייק, סינון | מוצג | מוצג |

## דברים שכדאי לדעת

- **הורדה של כמה תמונות כ-ZIP:** נעשית בלקוח. מורידים כל `url` ומכניסים לקובץ ZIP (למשל עם JSZip). זו לוגיקה שאינה React.
- **אחרי שינוי** (יצירה, לייק, העלאה, מחיקה), התשובה מכילה את המצב החדש. אפשר לעדכן ממנה את המסך, או לרענן את הנתונים מהשרת.
- **תאריכים** מגיעים כמחרוזות ISO. `eventDate` הוא תאריך בלבד: `"2026-10-21"`.
- **שליטה של המנהל:** `allowUpload: false` עוצר העלאות של משתתפים (המנהל ממשיך להעלות), ובממשק מסתירים להם את כפתור ההעלאה. `allowDownload: false` עוצר הורדות של משתתפים: הם מקבלים רק גרסת צפייה מוקטנת, ובממשק מסתירים את כפתורי ההורדה. אי אפשר למנוע לגמרי שמירה של מה שמוצג על המסך (צילום מסך), אבל הקובץ המלא לא מגיע אליהם.
- **קישור חדש** מבטל את הישן מיד. מי שכבר הצטרף נשאר באלבום. כדי להוציא מישהו, מסירים אותו מרשימת המשתתפים.
- **Swagger** בכתובת `/api-docs` מאפשר לנסות כל קריאה עם דוגמאות, לפני שכותבים אותה בלקוח.
