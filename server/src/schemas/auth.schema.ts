import { z } from 'zod';
import { emailSchema } from './common.schema';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'שם הוא שדה חובה').max(100, 'השם ארוך מדי'),
  email: emailSchema,
  password: z.string().min(6, 'הסיסמה צריכה להכיל לפחות 6 תווים').max(100, 'הסיסמה ארוכה מדי'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'סיסמה היא שדה חובה'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
