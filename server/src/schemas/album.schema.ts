import { z } from 'zod';

export const albumCategories = ['family', 'trip', 'class', 'other'] as const;

export const albumInputSchema = z.object({
  name: z.string().trim().min(1, 'שם האלבום הוא שדה חובה').max(100, 'שם האלבום ארוך מדי'),
  description: z.string().trim().max(1000, 'התיאור ארוך מדי').default(''),
  // תאריך האירוע בפורמט "2026-10-21", או ריק / null כשאין תאריך
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך צריך להיות בפורמט YYYY-MM-DD')
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'תאריך לא קיים')
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  category: z
    .enum(albumCategories, { errorMap: () => ({ message: 'קטגוריה צריכה להיות family, trip, class או other' }) })
    .default('other'),
  // כשכבוי, משתתפים לא מקבלים את הקובץ המלא וכפתורי ההורדה מוסתרים
  allowDownload: z.boolean({ invalid_type_error: 'allowDownload צריך להיות true או false' }).default(true),
  // כשכבוי, משתתפים לא יכולים להעלות. המנהל תמיד יכול
  allowUpload: z.boolean({ invalid_type_error: 'allowUpload צריך להיות true או false' }).default(true),
});

export const albumListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export type AlbumInput = z.infer<typeof albumInputSchema>;
