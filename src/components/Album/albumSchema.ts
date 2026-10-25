import { z } from "zod";

export const albumSchema = z.object({
    name: z.string().trim().min(1, "כותרת חובה").max(100, "עד 100 תווים"),
    description: z.string().max(1000, "עד 1000 תווים"),   // לא חובה: מחרוזת ריקה מותרת
    category: z.enum(["family", "other", "class","trip"], { message: "יש לבחור קטגוריה" }),
    allowUpload: z.boolean(),
    allowDownload:z.boolean()
});

export type AlbumFormData = z.infer<typeof albumSchema>;