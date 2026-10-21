// נקודת הכניסה: טוען את .env, מתחבר למסד הנתונים ומפעיל את השרת.
import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';

async function main() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('החיבור למסד הנתונים נכשל. בדקי את DATABASE_URL.');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`השרת רץ על http://localhost:${env.PORT}`);
    console.log(`תיעוד Swagger: http://localhost:${env.PORT}/api-docs`);
  });
}

void main();
