-- AlterTable
ALTER TABLE "Character" ALTER COLUMN "description" SET DEFAULT '';

-- AlterTable
ALTER TABLE "UserCharacter" ADD COLUMN     "genkey" TEXT;
