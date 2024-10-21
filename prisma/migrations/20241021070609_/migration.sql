/*
  Warnings:

  - A unique constraint covering the columns `[userId,subscriptionId]` on the table `Billing` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subscriptionId` on table `Billing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Billing" ALTER COLUMN "subscriptionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Billing_userId_subscriptionId_key" ON "Billing"("userId", "subscriptionId");
