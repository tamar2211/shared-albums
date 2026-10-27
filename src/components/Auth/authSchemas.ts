import {z} from "zod";

//הגדרת הסכמה
 export const registerSchema=z.object({
  name:z.string().trim().min(3,"שם קצר מידי").max(100,"שם ארוך מידי"),
  email:z.email("מייל לא תקין"),
  password:z.string().min(6,"סיסמה קצרה מידי").max(100,"סיסמה ארוכה מידי")

})
export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema=z.object({
  email:z.email("מייל לא תקין"),
  password:z.string().min(1,"סיסמה היא שדה חובה").max(100,"סיסמה ארוכה מידי")

})
export type LoginFormData=z.infer<typeof loginSchema>;
export const guestJoinSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "יש להזין שם")
    .max(50, "השם ארוך מדי (עד 50 תווים)"),
});

export type GuestJoinFormData = z.infer<typeof guestJoinSchema>;