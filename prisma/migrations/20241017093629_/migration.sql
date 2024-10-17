/*
  Warnings:

  - The values [SILVER,GOLD,PLATINUM] on the enum `Tier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Tier_new" AS ENUM ('FREE', 'PLUS', 'PREMIUM');
ALTER TABLE "User" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "tier" TYPE "Tier_new" USING ("tier"::text::"Tier_new");
ALTER TYPE "Tier" RENAME TO "Tier_old";
ALTER TYPE "Tier_new" RENAME TO "Tier";
DROP TYPE "Tier_old";
ALTER TABLE "User" ALTER COLUMN "tier" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "imageTokens" SET DEFAULT 3,
ALTER COLUMN "textTokens" SET DEFAULT 50;
