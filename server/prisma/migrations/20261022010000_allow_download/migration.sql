-- הרשאת הורדה למשתתפים: המנהל יכול לכבות אותה
ALTER TABLE "Album" ADD COLUMN "allowDownload" BOOLEAN NOT NULL DEFAULT true;
