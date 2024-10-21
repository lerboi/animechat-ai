/*
  Warnings:

  - You are about to drop the column `billingId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `Billing` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentMethod` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Billing" DROP CONSTRAINT "Billing_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_billingId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "billingId",
ADD COLUMN     "subscriptionId" TEXT NOT NULL DEFAULT 'default-sub-id',
ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'default-user-id';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLastFour" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL;

-- DropTable
DROP TABLE "Billing";

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
