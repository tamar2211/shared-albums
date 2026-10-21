import { z } from 'zod';

export const photoListQuerySchema = z.object({
  liked: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export const checkHashesSchema = z.object({
  hashes: z
    .array(z.string().trim().toLowerCase().regex(/^[a-f0-9]{64}$/, 'hash צריך להיות SHA-256 בן 64 תווים'))
    .max(500, 'אפשר לבדוק עד 500 קבצים בכל פעם'),
});
