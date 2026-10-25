import { z } from 'zod';

export const joinCodeParams = z.object({
  code: z.string().trim().min(1).max(64),
});

export const joinInputSchema = z.object({
  // שם לתצוגה: חובה לאורח, ולא חובה למשתמש רשום (אז נלקח השם מהחשבון)
  name: z
    .string()
    .trim()
    .min(1, 'צריך לכתוב שם לתצוגה')
    .max(50, 'השם ארוך מדי')
    .optional(),
});
