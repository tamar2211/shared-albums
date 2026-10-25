-- מעבר מרשימת מיילים לקישור הצטרפות.
-- נתונים קיימים נשמרים: לכל אלבום נוצר קוד הצטרפות, המנהל וכל משתמש רשום שהיה פעיל באלבום
-- הופכים למשתתפים, והתמונות והלייקים משויכים אליהם.

-- CreateEnum
CREATE TYPE "AlbumCategory" AS ENUM ('family', 'trip', 'class', 'other');

-- Album: קטגוריה וקוד הצטרפות
ALTER TABLE "Album" ADD COLUMN "category" "AlbumCategory" NOT NULL DEFAULT 'other',
ADD COLUMN "joinCode" TEXT;

UPDATE "Album" SET "joinCode" = substr(md5(random()::text || clock_timestamp()::text || "id"::text), 1, 24);

ALTER TABLE "Album" ALTER COLUMN "joinCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Album_joinCode_key" ON "Album"("joinCode");

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "albumId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_albumId_idx" ON "Participant"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_albumId_userId_key" ON "Participant"("albumId", "userId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- המנהל של כל אלבום
INSERT INTO "Participant" ("albumId", "name", "userId", "isOwner")
SELECT a."id", u."name", u."id", true
FROM "Album" a JOIN "User" u ON u."id" = a."ownerId";

-- משתמשים רשומים שהיו ברשימת המיילים
INSERT INTO "Participant" ("albumId", "name", "userId")
SELECT DISTINCT m."albumId", u."name", u."id"
FROM "AlbumMember" m JOIN "User" u ON u."email" = m."email"
WHERE NOT EXISTS (SELECT 1 FROM "Participant" x WHERE x."albumId" = m."albumId" AND x."userId" = u."id");

-- משתמשים שהעלו תמונות
INSERT INTO "Participant" ("albumId", "name", "userId")
SELECT DISTINCT p."albumId", u."name", u."id"
FROM "Photo" p JOIN "User" u ON u."id" = p."uploadedById"
WHERE NOT EXISTS (SELECT 1 FROM "Participant" x WHERE x."albumId" = p."albumId" AND x."userId" = u."id");

-- משתמשים שסימנו לייקים
INSERT INTO "Participant" ("albumId", "name", "userId")
SELECT DISTINCT ph."albumId", u."name", u."id"
FROM "PhotoLike" l
JOIN "Photo" ph ON ph."id" = l."photoId"
JOIN "User" u ON u."id" = l."userId"
WHERE NOT EXISTS (SELECT 1 FROM "Participant" x WHERE x."albumId" = ph."albumId" AND x."userId" = u."id");

-- Photo: מי העלה עובר ממשתמש למשתתף
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_uploadedById_fkey";

UPDATE "Photo" p SET "uploadedById" = x."id"
FROM "Participant" x
WHERE x."albumId" = p."albumId" AND x."userId" = p."uploadedById";

ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PhotoLike: הלייק שייך למשתתף
ALTER TABLE "PhotoLike" ADD COLUMN "participantId" INTEGER;

UPDATE "PhotoLike" l SET "participantId" = x."id"
FROM "Photo" ph, "Participant" x
WHERE ph."id" = l."photoId" AND x."albumId" = ph."albumId" AND x."userId" = l."userId";

DELETE FROM "PhotoLike" WHERE "participantId" IS NULL;

ALTER TABLE "PhotoLike" DROP CONSTRAINT "PhotoLike_userId_fkey";
ALTER TABLE "PhotoLike" DROP CONSTRAINT "PhotoLike_pkey";
DROP INDEX "PhotoLike_userId_idx";
ALTER TABLE "PhotoLike" DROP COLUMN "userId";
ALTER TABLE "PhotoLike" ALTER COLUMN "participantId" SET NOT NULL;
ALTER TABLE "PhotoLike" ADD CONSTRAINT "PhotoLike_pkey" PRIMARY KEY ("photoId", "participantId");

-- CreateIndex
CREATE INDEX "PhotoLike_participantId_idx" ON "PhotoLike"("participantId");

-- AddForeignKey
ALTER TABLE "PhotoLike" ADD CONSTRAINT "PhotoLike_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- רשימת המיילים כבר לא בשימוש
DROP TABLE "AlbumMember";
