-- Fix User Credits Script
-- This script ensures all FREE plan users have the correct amount of credits

-- Update all FREE plan users with 0 or NULL credits to have 10 credits
UPDATE "User" 
SET "credits" = 10 
WHERE "plan" = 'FREE' 
  AND ("credits" = 0 OR "credits" IS NULL OR "credits" < 10);

-- Verify the update
SELECT 
  "plan",
  COUNT(*) as user_count,
  MIN("credits") as min_credits,
  MAX("credits") as max_credits,
  AVG("credits") as avg_credits
FROM "User"
GROUP BY "plan"
ORDER BY "plan";

-- List users that still have incorrect credits
SELECT 
  "id",
  "email",
  "plan",
  "credits",
  "createdAt"
FROM "User"
WHERE "plan" = 'FREE' AND "credits" < 10
ORDER BY "createdAt" DESC
LIMIT 10;