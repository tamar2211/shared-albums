import { z } from 'zod';
import { emailSchema } from './common.schema';

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
  status: z
    .enum(['open', 'locked'], { errorMap: () => ({ message: 'סטטוס צריך להיות open או locked' }) })
    .default('open'),
  memberEmails: z.array(emailSchema).max(200, 'יותר מדי משתתפים').default([]),
});

export const albumListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export type AlbumInput = z.infer<typeof albumInputSchema>;
