/*
  Warnings:

  - The values [TRIALING] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[activeUserId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nextSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'INACTIVE');
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "activeUserId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nextSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_activeUserId_key" ON "Subscription"("activeUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_nextSubscriptionId_key" ON "Subscription"("nextSubscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_activeUserId_fkey" FOREIGN KEY ("activeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_nextSubscriptionId_fkey" FOREIGN KEY ("nextSubscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
