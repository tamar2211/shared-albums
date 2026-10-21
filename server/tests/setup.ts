// רץ לפני כל קובץ בדיקות: מפנה את השרת למסד הבדיקות ומחליף את Cloudinary בגרסה מדומה.
import dotenv from 'dotenv';
import { vi } from 'vitest';

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET ||= 'test-secret-that-is-long-enough-for-the-tests-123';
process.env.CLOUDINARY_CLOUD_NAME ||= 'test-cloud';
process.env.CLOUDINARY_API_KEY ||= 'test-key';
process.env.CLOUDINARY_API_SECRET ||= 'test-secret';

// בבדיקות לא מעלים קבצים אמיתיים ל-Cloudinary
vi.mock('../src/services/storage.service', () => {
  let counter = 0;
  return {
    uploadImage: vi.fn(async (_buffer: Buffer, albumId: number) => {
      counter += 1;
      const publicId = `test/album-${albumId}/photo-${counter}`;
      return { url: `https://images.test/${publicId}.png`, publicId, width: 1, height: 1 };
    }),
    deleteImages: vi.fn(async () => undefined),
    thumbUrl: (publicId: string) => `https://images.test/thumb/${publicId}.png`,
  };
});
