-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('U12', 'U14', 'U16', 'U18', 'OVER_18', 'ALL_AGES');

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "ageGroup" "AgeGroup" NOT NULL DEFAULT 'ALL_AGES',
ALTER COLUMN "skillLevel" SET DEFAULT 'ALL_LEVELS';
