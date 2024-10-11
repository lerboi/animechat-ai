/*
  Warnings:

  - You are about to drop the column `chatHistory` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `persona` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the `_UserCharacters` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserCharacters" DROP CONSTRAINT "_UserCharacters_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserCharacters" DROP CONSTRAINT "_UserCharacters_B_fkey";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "chatHistory",
DROP COLUMN "persona";

-- DropTable
DROP TABLE "_UserCharacters";

-- CreateTable
CREATE TABLE "UserCharacter" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "chatHistory" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCharacter_userId_characterId_version_key" ON "UserCharacter"("userId", "characterId", "version");

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
