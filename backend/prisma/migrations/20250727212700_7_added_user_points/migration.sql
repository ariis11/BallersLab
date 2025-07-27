/*
  Warnings:

  - You are about to drop the column `winnings` on the `tournament_participants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tournament_participants" DROP COLUMN "winnings",
ADD COLUMN     "points_earned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tournamentsPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_points_userId_ageGroup_key" ON "user_points"("userId", "ageGroup");

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
