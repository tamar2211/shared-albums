import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('כתובת מייל לא תקינה');

export const albumIdParams = z.object({
  albumId: z.coerce.number().int().positive('מזהה האלבום לא תקין'),
});

export const photoIdParams = albumIdParams.extend({
  photoId: z.coerce.number().int().positive('מזהה התמונה לא תקין'),
});
