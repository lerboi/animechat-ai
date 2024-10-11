/*
  Warnings:

  - A unique constraint covering the columns `[personaId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "personaId" INTEGER,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "persona" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "nationality" TEXT,
    "sexuality" TEXT,
    "height" TEXT,
    "species" TEXT,
    "occupation" TEXT,
    "affiliation" TEXT,
    "mind" TEXT,
    "personality" TEXT,
    "appearance" TEXT,
    "clothes" TEXT,
    "attributes" TEXT,
    "likes" TEXT,
    "dislikes" TEXT,
    "description" TEXT,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_personaId_key" ON "Character"("personaId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
