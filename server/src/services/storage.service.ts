// אחסון קבצי התמונות ב-Cloudinary. כל השאר בשרת לא מכיר את Cloudinary ישירות,
// ולכן בבדיקות האוטומטיות אפשר להחליף את הקובץ הזה בגרסה מדומה.
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface StoredImage {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
}

/** מעלה קובץ לתיקיית האלבום. תמונות גדולות מוקטנות ל-2500 פיקסלים לכל היותר. */
export function uploadImage(buffer: Buffer, albumId: number): Promise<StoredImage> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shared-albums/album-${albumId}`,
        resource_type: 'image',
        transformation: [{ width: 2500, height: 2500, crop: 'limit' }],
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width ?? null,
          height: result.height ?? null,
        });
      },
    );
    stream.end(buffer);
  });
}

/** מחיקת תמונות. כישלון כאן נרשם בלוג ולא מפיל את הבקשה, כי הרשומה במסד כבר נמחקה. */
export async function deleteImages(publicIds: string[]): Promise<void> {
  for (let i = 0; i < publicIds.length; i += 100) {
    const batch = publicIds.slice(i, i + 100);
    try {
      await cloudinary.api.delete_resources(batch);
    } catch (err) {
      console.error('מחיקה מ-Cloudinary נכשלה', err instanceof Error ? err.message : err);
    }
  }
}

/** גרסת צפייה: עד 1200 פיקסלים, בשביל משתתפים באלבום שההורדה בו כבויה */
export function viewUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    width: 1200,
    height: 1200,
    crop: 'limit',
    fetch_format: 'auto',
    quality: 'auto',
  });
}

/** כתובת לתמונה ממוזערת לגלריה: 400x400, חיתוך חכם, פורמט ואיכות אוטומטיים. */
export function thumbUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    fetch_format: 'auto',
    quality: 'auto',
  });
}
