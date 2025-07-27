/*
  Warnings:

  - You are about to drop the `bracket_seeds` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "BracketMatchStatus" ADD VALUE 'BYE';

-- DropForeignKey
ALTER TABLE "bracket_seeds" DROP CONSTRAINT "bracket_seeds_bracketId_fkey";

-- DropForeignKey
ALTER TABLE "bracket_seeds" DROP CONSTRAINT "bracket_seeds_matchId_fkey";

-- DropForeignKey
ALTER TABLE "bracket_seeds" DROP CONSTRAINT "bracket_seeds_playerId_fkey";

-- DropTable
DROP TABLE "bracket_seeds";
