// קריאה ובדיקה של משתני הסביבה. אם משהו חסר, השרת לא עולה ומסביר מה חסר.
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL חסר'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET צריך להכיל לפחות 32 תווים'),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME חסר'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY חסר'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET חסר'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('משתני סביבה חסרים או לא תקינים:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('העתיקי את .env.example לקובץ .env ומלאי את הערכים.');
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  isProduction: raw.NODE_ENV === 'production',
};

export const uploadLimits = {
  maxFileSizeMb: 10,
  maxFilesPerRequest: 30,
};
