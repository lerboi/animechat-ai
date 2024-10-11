/*
  Warnings:

  - A unique constraint covering the columns `[password]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "chatHistory" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CharacterTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterTags_AB_unique" ON "_CharacterTags"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterTags_B_index" ON "_CharacterTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterTags" ADD CONSTRAINT "_CharacterTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterTags" ADD CONSTRAINT "_CharacterTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
