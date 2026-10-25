# מתחילים כאן: מה-ZIP ועד שרת באינטרנט

המדריך הזה מיועד למי שעוד לא העלתה שרת לאינטרנט. עובדים לפי הסדר.

**הערה חשובה:** שמות הכפתורים כאן נכונים למיטב ידיעתי, אבל לא יכולתי לפתוח את האתרים ולוודא את הממשק העדכני. אם כפתור נקרא קצת אחרת, חפשי את המילה הקרובה ביותר.

**מה צריך:** חשבון GitHub, חשבון Render, Node.js (גרסת LTS) במחשב. Neon ו-Cloudinary נפתח בדרך.

---

## חלק 0 – הרצה ראשונה במחשב (מומלץ לפני הכל)

1. חלצי את ה-ZIP: קליק ימני ← "חלץ הכל" (Extract All). תתקבל תיקייה `backend-project`.
2. פתחי אותה ב-VS Code ופתחי טרמינל (Terminal ← New Terminal).
3. הריצי:
   ```bash
   npm install
   ```
   הפקודה יוצרת את `node_modules` ואת הקובץ `package-lock.json`. את `package-lock.json` מעלים ל-GitHub, את `node_modules` לא.
4. המשיכי לחלק ב (מסד נתונים) ולחלק ג1 (Cloudinary), ואז חזרי לכאן לשלבים 5–8.
5. העתיקי את `.env.example` לקובץ חדש בשם `.env` באותה תיקייה, ומלאי את הערכים.
6. ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
7. פתחי בדפדפן `http://localhost:4000/api-docs`. אם Swagger נפתח, השרת עובד.
8. להרצת כל הבדיקות: `npm run check`. אם משהו נכשל, העתיקי את ההודעה מהטרמינל.

---

## חלק א – GitHub

**אם כבר יש לך מאגר של פרויקט ה-React (react-project):** מומלץ לשים את השרת בתוכו, בתיקייה בשם `server`. כך יש קישור אחד להגשה. העתיקי את תוכן `backend-project` לתיקייה `react-project/server`, בלי `node_modules` ובלי `.env`, והעלי כרגיל (commit ו-push, או Upload files בדפדפן).

**אם רוצים מאגר נפרד לשרת:**
1. נכנסים ל-github.com ונרשמים (Sign up), אם אין חשבון.
2. לוחצים על **+** למעלה ← **New repository**.
3. שם: `shared-albums-backend`. בוחרים **Public** או **Private**. לא מסמנים "Add a README" (יש לנו כבר).
4. לוחצים **Create repository**.
5. בדף המאגר הריק לוחצים על הקישור **uploading an existing file**.
6. גוררים לחלון את **התוכן** של התיקייה `backend-project`: התיקיות `src`, `prisma`, `tests`, `docs` וכל הקבצים. **לא** לגרור את `node_modules` ולא את `.env`.
7. בתחתית לוחצים **Commit changes**.
8. בדיקה: בדף המאגר רואים את `package.json`, `src`, `prisma`. כדאי לוודא שגם `.gitignore` ו-`.env.example` עלו. קבצים שמתחילים בנקודה לפעמים לא נגררים, ואז מוסיפים אותם דרך **Add file ← Upload files**.
9. ודאי ש-`.env` **לא** מופיע במאגר. אם הוא שם בטעות: מוחקים אותו, ומחליפים את כל הסיסמאות שהיו בו.

---

## חלק ב – מסד נתונים (Neon, PostgreSQL חינמי)

1. נכנסים ל-neon.tech ← **Sign up** ← הרשמה עם Google.
2. יוצרים פרויקט (**Create project**). שם: `shared-albums`. גרסת Postgres: ברירת המחדל. אזור: הקרוב לאירופה.
3. בדף הפרויקט לוחצים **Connect**. נפתח חלון עם **Connection string** שמתחיל ב-`postgresql://`.
4. **כבי את Connection pooling** בחלון הזה, אם יש מתג כזה. Prisma migrations צריכות חיבור ישיר, וכתובת ישירה לא כוללת `-pooler` בשם השרת.
5. העתיקי את הכתובת. זה ה-`DATABASE_URL`.
6. **מסד לבדיקות:** בתפריט הצד **Branches** ← **Create branch**, שם `test`. בענף החדש לוחצים שוב **Connect** ומעתיקים את הכתובת שלו. זה ה-`TEST_DATABASE_URL`. הבדיקות מוחקות את כל הנתונים בו, ולכן הוא חייב להיות נפרד.
7. **שמירה בטוחה:** הכתובות האלה כוללות סיסמה. הן נשמרות רק בקובץ `.env` במחשב ובהגדרות של Render. לא שולחים אותן בצ'אט, במייל או בגיט.
8. **מגבלות:** בתוכנית החינמית יש מגבלת נפח ושעות פעילות, והמסד "נרדם" כשאין שימוש. הבקשה הראשונה אחריו איטית יותר. לפרויקט כזה זה מספיק, אבל לא כדאי להניח שאין מגבלות בכלל.

---

## חלק ג – Render

### ג1. Cloudinary (לפני Render)
1. נכנסים ל-cloudinary.com ← **Sign up** עם Google. אין צורך בכרטיס אשראי.
2. בלוח הבקרה פותחים את **API Keys** (בדרך כלל תחת Settings).
3. מעתיקים שלושה ערכים: **Cloud name**, **API Key**, **API Secret**.

### ג2. יצירת השרת ב-Render
1. נכנסים ל-render.com ← **Sign in with GitHub** (כבר עשית את זה בעבר).
2. **New +** ← **Web Service**.
3. בוחרים את המאגר מהרשימה (אם הוא לא מופיע: **Configure account** ונותנים ל-Render גישה אליו).
4. ממלאים:

| שדה | ערך |
|---|---|
| Name | `shared-albums-api` |
| Root Directory | `server` אם השרת בתוך מאגר ה-React. ריק אם המאגר הוא השרת עצמו |
| Runtime / Language | `Node` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm run start:prod` |
| Instance Type | `Free` |

5. **Environment Variables** ← **Add Environment Variable** לכל אחד:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | הכתובת מ-Neon (הראשית, לא של test) |
| `JWT_SECRET` | מחרוזת אקראית של 40 תווים לפחות. אפשר ללחוץ **Generate** אם יש כפתור כזה |
| `CLOUDINARY_CLOUD_NAME` | מ-Cloudinary |
| `CLOUDINARY_API_KEY` | מ-Cloudinary |
| `CLOUDINARY_API_SECRET` | מ-Cloudinary |
| `CORS_ORIGINS` | `http://localhost:5173` ובהמשך גם כתובת הלקוח ב-Render, מופרדות בפסיק |

6. תחת **Advanced** (אם קיים): **Health Check Path** = `/api/health`.
7. **Prisma Migrations:** לא צריך להריץ ידנית. ה-Start Command מריץ `prisma migrate deploy` לפני שהשרת עולה, בכל Deploy.
8. לוחצים **Create Web Service**. Render בונה ומעלה. אפשר לעקוב בלשונית **Logs**.
9. כשמופיע **Live**, הכתובת למעלה נראית כמו `https://shared-albums-api.onrender.com`.

**נתוני הדגמה בענן (אופציונלי):** במחשב, החליפי זמנית ב-`.env` את `DATABASE_URL` לכתובת של המסד הראשי, הוסיפי `SEED_PASSWORD`, והריצי `npm run db:seed`.

**הקובץ render.yaml:** מתאים כשהשרת הוא מאגר נפרד, דרך **New + ← Blueprint**. אם השרת בתוך מאגר ה-React, השתמשי בהגדרה הידנית שלמעלה.

**מגבלת התוכנית החינמית:** השרת נרדם אחרי זמן ללא שימוש, והבקשה הראשונה אחרי זה לוקחת עד דקה. לפני הצגה, פותחים את האתר כמה דקות קודם.

---

## חלק ד – בדיקה שהכל עובד

1. פתחי `https://<הכתובת שלך>/api/health`. אמור להופיע `{"ok":true}`.
2. פתחי `https://<הכתובת שלך>/api-docs`. נפתח Swagger.
3. **התחברות מתוך Swagger:** פתחי `POST /api/auth/login` ← **Try it out**. אם הרצת seed, כתבי מייל של משתמש הדגמה (`rachel.demo@example.com`) ואת SEED_PASSWORD. אחרת, הירשמי קודם ב-`POST /api/auth/register`. לחצי **Execute**.
4. **קבלת JWT:** בתשובה יש `token`. העתיקי אותו, בלי המירכאות.
5. **Authorize:** לחצי על הכפתור **Authorize** למעלה, הדביקי את הטוקן ולחצי **Authorize** ← **Close**.
6. **קריאה מוגנת:** `GET /api/auth/me` ← **Try it out** ← **Execute**. אמור לחזור המשתמש שלך.
7. **הוספת רשומה:** `POST /api/albums` ← **Try it out** ← **Execute** עם הדוגמה. אמור לחזור 201 עם `id`.
8. **שליפה:** `GET /api/albums/{albumId}` עם ה-`id` שקיבלת. האלבום חוזר מהמסד.
9. **בדיקת 401:** לחצי **Authorize** ← **Logout**, ונסי שוב את `GET /api/auth/me`. אמור לחזור 401.
10. **בדיקת 403:** התחברי כ-`miriam.demo@example.com` (לא הצטרפה לאף אלבום) ונסי לפתוח אלבום של רחל. אמור לחזור 403.
11. **הצטרפות כאורח:** לחצי **Authorize** ← **Logout**. פתחי `POST /api/join/{code}`, הדביקי קוד הצטרפות (הוא מודפס בסוף ה-seed, ומופיע גם ב-`joinCode` כשרחל פותחת את האלבום), ושלחי `{ "name": "אורח" }`. מהתשובה העתיקי את ה-`token`, לחצי **Authorize** והדביקי אותו. עכשיו `GET /api/albums/{albumId}` של האלבום הזה אמור לעבוד, ו-`GET /api/albums` אמור להחזיר 401, כי אורח הוא לא משתמש רשום.

---

## חלק ה – פתרון תקלות

| תקלה | מה עושים |
|---|---|
| **Build Failed** ב-Render | פתחי Logs ומצאי את השורה האדומה הראשונה. ודאי ש-`package-lock.json` עלה, וש-Root Directory נכון |
| `DATABASE_URL` שגוי, או "Can't reach database server" | העתיקי מחדש מ-Neon. ודאי שהכתובת מסתיימת ב-`?sslmode=require` ושאין רווחים או מירכאות מיותרות |
| שגיאת Prisma ב-migrate, למשל timeout או lock | השתמשי בכתובת **הישירה** (בלי `-pooler`). ב-Neon כבי Connection pooling והעתיקי שוב |
| "@prisma/client did not initialize yet" | הריצי `npm install` שוב (הוא מריץ `prisma generate`), או `npx prisma generate` |
| השרת לא עולה: "JWT_SECRET צריך להכיל לפחות 32 תווים" | הגדירי JWT_SECRET ארוך יותר |
| השרת לא עולה ומפרט משתנה חסר | הוסיפי את המשתנה ב-`.env` במחשב, או ב-Environment ב-Render |
| **שגיאת CORS** בדפדפן | הוסיפי את כתובת הלקוח המדויקת ל-`CORS_ORIGINS`, בלי `/` בסוף. אחר כך שמרי ב-Render ועשי Deploy מחדש |
| **401** | אין טוקן, הוא לא הועתק במלואו, או שפג תוקפו. התחברי מחדש ולחצי Authorize |
| **403** | לא הצטרף לאלבום או הוסר ממנו, הפעולה מותרת רק למנהל, או שמשתתף מנסה להעלות כשההעלאה כבויה |
| **Swagger לא נפתח** | ודאי שהכתובת היא `/api-docs` ושהתיקייה `docs` עם `openapi.json` עלתה ל-GitHub |
| השרת איטי מאוד בבקשה הראשונה | התוכנית החינמית "נרדמת". מחכים עד דקה |
| העלאת תמונה נכשלת | בדקי את שלושת ערכי Cloudinary. ודאי שהקובץ קטן מ-10MB ושהוא תמונה |
| `npm test` נכשל מיד | חסר `TEST_DATABASE_URL`, או שהוא זהה ל-`DATABASE_URL`. ראי חלק ב, שלב 6 |
