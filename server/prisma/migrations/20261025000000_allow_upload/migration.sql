-- הרשאת העלאה למשתתפים במקום סטטוס open/locked. המנהל תמיד יכול להעלות.
ALTER TABLE "Album" ADD COLUMN "allowUpload" BOOLEAN NOT NULL DEFAULT true;

-- המרת הנתונים הקיימים: open -> true, locked -> false
UPDATE "Album" SET "allowUpload" = ("status" = 'open');

ALTER TABLE "Album" DROP COLUMN "status";
DROP TYPE "AlbumStatus";
