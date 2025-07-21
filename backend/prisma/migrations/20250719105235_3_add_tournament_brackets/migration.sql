-- CreateEnum
CREATE TYPE "BracketMatchStatus" AS ENUM ('WAITING_FOR_PLAYERS', 'PENDING', 'SUBMITTED', 'CONFIRMED', 'DISPUTED');

-- AlterTable
ALTER TABLE "tournament_participants" ADD COLUMN     "eliminatedInRound" INTEGER;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "bracketGenerated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tournament_brackets" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "totalPlayers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_matches" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "status" "BracketMatchStatus" NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    "winnerId" TEXT,
    "nextMatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bracket_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_match_submissions" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "score1" INTEGER NOT NULL,
    "score2" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bracket_match_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_seeds" (
    "id" TEXT NOT NULL,
    "bracketId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seedPosition" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bracket_seeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_brackets_tournamentId_key" ON "tournament_brackets"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_matches_bracketId_roundNumber_matchNumber_key" ON "bracket_matches"("bracketId", "roundNumber", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_match_submissions_matchId_submittedBy_key" ON "bracket_match_submissions"("matchId", "submittedBy");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_seeds_bracketId_seedPosition_key" ON "bracket_seeds"("bracketId", "seedPosition");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_seeds_bracketId_playerId_key" ON "bracket_seeds"("bracketId", "playerId");

-- AddForeignKey
ALTER TABLE "tournament_brackets" ADD CONSTRAINT "tournament_brackets_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_matches" ADD CONSTRAINT "bracket_matches_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "tournament_brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_matches" ADD CONSTRAINT "bracket_matches_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_matches" ADD CONSTRAINT "bracket_matches_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_matches" ADD CONSTRAINT "bracket_matches_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_matches" ADD CONSTRAINT "bracket_matches_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "bracket_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_match_submissions" ADD CONSTRAINT "bracket_match_submissions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "bracket_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_match_submissions" ADD CONSTRAINT "bracket_match_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_seeds" ADD CONSTRAINT "bracket_seeds_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "tournament_brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_seeds" ADD CONSTRAINT "bracket_seeds_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_seeds" ADD CONSTRAINT "bracket_seeds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "bracket_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
