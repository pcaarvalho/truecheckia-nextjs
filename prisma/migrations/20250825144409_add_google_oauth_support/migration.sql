-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "credits" INTEGER NOT NULL DEFAULT 10,
    "creditsResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "avatar" TEXT,
    "apiKey" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCurrentPeriodEnd" DATETIME,
    "stripeCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("apiKey", "avatar", "createdAt", "credits", "creditsResetAt", "email", "emailVerificationExpires", "emailVerificationToken", "emailVerified", "id", "name", "password", "passwordResetExpires", "passwordResetToken", "plan", "role", "stripeCancelAtPeriodEnd", "stripeCurrentPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "updatedAt") SELECT "apiKey", "avatar", "createdAt", "credits", "creditsResetAt", "email", "emailVerificationExpires", "emailVerificationToken", "emailVerified", "id", "name", "password", "passwordResetExpires", "passwordResetToken", "plan", "role", "stripeCancelAtPeriodEnd", "stripeCurrentPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
