// רץ פעם אחת לפני כל הבדיקות: מוודא שיש מסד בדיקות נפרד ומעדכן בו את הטבלאות.
import { execSync } from 'node:child_process';
import dotenv from 'dotenv';

export default function globalSetup() {
  dotenv.config();

  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) {
    throw new Error('חסר TEST_DATABASE_URL בקובץ .env. הבדיקות צריכות מסד נתונים נפרד, כי הן מוחקות את כל הנתונים בו.');
  }
  if (testUrl === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL זהה ל-DATABASE_URL. הבדיקות היו מוחקות את הנתונים האמיתיים, ולכן הן לא ירוצו.');
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
  });
}
