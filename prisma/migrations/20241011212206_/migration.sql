/*
  Warnings:

  - You are about to drop the column `userId` on the `Character` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_userId_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Persona" ALTER COLUMN "age" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_UserCharacters" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserCharacters_AB_unique" ON "_UserCharacters"("A", "B");

-- CreateIndex
CREATE INDEX "_UserCharacters_B_index" ON "_UserCharacters"("B");

-- AddForeignKey
ALTER TABLE "_UserCharacters" ADD CONSTRAINT "_UserCharacters_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserCharacters" ADD CONSTRAINT "_UserCharacters_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
