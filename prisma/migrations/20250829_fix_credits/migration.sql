-- AlterTable - Set default credits to 10 for users with 0 credits
UPDATE "User" SET "credits" = 10 WHERE "credits" = 0 AND "plan" = 'FREE';

-- Ensure the default is set correctly (this is idempotent)
ALTER TABLE "User" ALTER COLUMN "credits" SET DEFAULT 10;