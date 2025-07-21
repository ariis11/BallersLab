const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BracketGenerationService {
  /**
   * Generate bracket for a tournament when it starts
   */
  async generateBracket(tournamentId) {
    try {
      // Get tournament and participants
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.bracketGenerated) {
        throw new Error('Bracket already generated for this tournament');
      }

      const participants = tournament.participants.filter(p => p.status === 'REGISTERED');
      const playerCount = participants.length;

      if (playerCount < 2) {
        throw new Error('Need at least 2 players to generate bracket');
      }

      // Calculate rounds needed
      const totalRounds = this.calculateRounds(playerCount);

      // Create bracket
      const bracket = await prisma.tournamentBracket.create({
        data: {
          tournamentId,
          totalRounds,
          totalPlayers: playerCount
        }
      });

      // Create all matches for all rounds
      await this.createAllMatches(bracket.id, totalRounds);

      // Seed players into first round
      await this.seedPlayers(bracket.id, participants);

      // Update tournament
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          bracketGenerated: true
        }
      });

      return bracket;
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  }

  /**
   * Calculate number of rounds needed based on player count
   */
  calculateRounds(playerCount) {
    return Math.ceil(Math.log2(playerCount));
  }

  /**
   * Create all matches for all rounds
   */
  async createAllMatches(bracketId, totalRounds) {
    const matches = [];
    let matchNumber = 1; // Start with 1 and increment continuously

    for (let round = 1; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          bracketId,
          roundNumber: round,
          matchNumber: matchNumber++,
          status: 'WAITING_FOR_PLAYERS'
        });
      }
    }

    // Create all matches
    await prisma.bracketMatch.createMany({
      data: matches
    });

    // Set up next match relationships
    await this.setupNextMatchRelationships(bracketId, totalRounds);
  }

  /**
   * Set up next match relationships for bracket progression
   */
  async setupNextMatchRelationships(bracketId, totalRounds) {
    for (let round = 1; round < totalRounds; round++) {
      const currentRoundMatches = await prisma.bracketMatch.findMany({
        where: {
          bracketId,
          roundNumber: round
        },
        orderBy: { matchNumber: 'asc' }
      });

      const nextRoundMatches = await prisma.bracketMatch.findMany({
        where: {
          bracketId,
          roundNumber: round + 1
        },
        orderBy: { matchNumber: 'asc' }
      });

      // Link current round matches to next round matches
      for (let i = 0; i < currentRoundMatches.length; i += 2) {
        const nextMatchIndex = Math.floor(i / 2);
        if (nextMatchIndex < nextRoundMatches.length) {
          await prisma.bracketMatch.updateMany({
            where: {
              id: {
                in: [currentRoundMatches[i].id, currentRoundMatches[i + 1]?.id].filter(Boolean)
              }
            },
            data: {
              nextMatchId: nextRoundMatches[nextMatchIndex].id
            }
          });
        }
      }
    }
  }

  /**
   * Seed players into first round matches
   */
  async seedPlayers(bracketId, participants) {
    const firstRoundMatches = await prisma.bracketMatch.findMany({
      where: {
        bracketId,
        roundNumber: 1
      },
      orderBy: { matchNumber: 'asc' }
    });

    // Shuffle participants for random seeding
    const shuffledParticipants = this.shuffleArray([...participants]);

    // Create seeds and assign players to first round matches
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      const matchIndex = Math.floor(i / 2);
      if (matchIndex < firstRoundMatches.length) {
        const match = firstRoundMatches[matchIndex];
        const player1 = shuffledParticipants[i];
        const player2 = shuffledParticipants[i + 1];

        // Update match with players
        await prisma.bracketMatch.update({
          where: { id: match.id },
          data: {
            player1Id: player1.userId,
            player2Id: player2?.userId || null,
            status: player2 ? 'PENDING' : 'WAITING_FOR_PLAYERS'
          }
        });

        // Create seeds
        await prisma.bracketSeed.create({
          data: {
            bracketId,
            playerId: player1.userId,
            seedPosition: i + 1,
            matchId: match.id
          }
        });

        if (player2) {
          await prisma.bracketSeed.create({
            data: {
              bracketId,
              playerId: player2.userId,
              seedPosition: i + 2,
              matchId: match.id
            }
          });
        }
      }
    }
  }

  /**
   * Shuffle array for random seeding
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = new BracketGenerationService(); 