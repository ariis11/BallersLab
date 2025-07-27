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

      // Calculate bracket structure
      const totalSlots = Math.pow(2, Math.ceil(Math.log2(playerCount)));
      const totalRounds = Math.log2(totalSlots);
      const totalByes = totalSlots - playerCount;

      console.log(`Generating bracket: ${playerCount} players, ${totalSlots} slots, ${totalByes} byes, ${totalRounds} rounds`);

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

      // Seed players into first round with proper bye handling
      await this.seedPlayersWithByes(bracket.id, participants, totalByes);

      // Update tournament
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          bracketGenerated: true
        }
      });

      console.log(`Bracket generated successfully for tournament ${tournamentId}`);
      return bracket;
    } catch (error) {
      console.error('Error generating bracket:', error);
      throw error;
    }
  }

  /**
   * Create all matches for all rounds
   */
  async createAllMatches(bracketId, totalRounds) {
    const matches = [];
    let matchNumber = 1;

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
   * Seed players with proper bye handling
   */
  async seedPlayersWithByes(bracketId, participants, totalByes) {
    const firstRoundMatches = await prisma.bracketMatch.findMany({
      where: {
        bracketId,
        roundNumber: 1
      },
      orderBy: { matchNumber: 'asc' }
    });

    // Sort participants by registration date (first come, first served for seeding)
    // In a real system, you might want to use skill ratings or previous tournament performance
    const sortedPlayers = this.shuffleArray([...participants]);

    // Assign seeds to players
    const seededPlayers = sortedPlayers.map((player, index) => ({
      ...player,
      seed: index + 1
    }));

    // Generate correct bracket matchups
    const totalSlots = seededPlayers.length + totalByes;
    const matchups = this.generateCorrectBracketMatchups(totalSlots);

    console.log(`Generated matchups:`, matchups);

    // Assign players to first round matches
    for (let i = 0; i < matchups.length; i++) {
      const [seed1, seed2] = matchups[i];
      const match = firstRoundMatches[i];

      const player1 = seededPlayers.find(p => p.seed === seed1);
      const player2 = seededPlayers.find(p => p.seed === seed2);

      if (player1 && player2) {
        // Both players exist - regular match
        await this.assignPlayersToMatch(match.id, player1, player2);
      } else if (player1) {
        // Player1 exists, seed2 is a bye
        await this.assignPlayerVsBye(match.id, player1);
      } else if (player2) {
        // Player2 exists, seed1 is a bye
        await this.assignPlayerVsBye(match.id, player2);
      }
    }
  }

  /**
   * Generate correct bracket matchups using standard tournament seeding
   */
  generateCorrectBracketMatchups(totalSlots) {
    const seedOrder = this.generateSeedOrder(totalSlots);
    const matchups = [];

    for (let i = 0; i < seedOrder.length; i += 2) {
      matchups.push([seedOrder[i], seedOrder[i + 1]]);
    }

    return matchups;
  }

  /**
   * Generate standard bracket seeding order
   */
  generateSeedOrder(totalSlots) {
    if ((totalSlots & (totalSlots - 1)) !== 0) {
      throw new Error("totalSlots must be a power of 2");
    }

    function buildSeeds(n) {
      if (n === 1) return [1];
      const prev = buildSeeds(n / 2);
      const result = [];
      for (let i = 0; i < prev.length; i++) {
        result.push(prev[i]);
        result.push(n + 1 - prev[i]);
      }
      return result;
    }

    return buildSeeds(totalSlots);
  }

  /**
   * Assign two players to a match
   */
  async assignPlayersToMatch(matchId, player1, player2) {
    await prisma.bracketMatch.update({
      where: { id: matchId },
      data: {
        player1Id: player1.userId,
        player2Id: player2.userId,
        status: 'PENDING'
      }
    });
  }

  /**
   * Assign a player vs a bye (advance player immediately)
   */
  async assignPlayerVsBye(matchId, player) {
    // Update match to show player vs bye
    await prisma.bracketMatch.update({
      where: { id: matchId },
      data: {
        player1Id: player.userId,
        player2Id: null,
        status: 'BYE'
      }
    });

    // Immediately advance bye player to next round
    await this.advanceByePlayerToNextRound(matchId, player.userId);
  }

  /**
   * Advance bye player to next round
   */
  async advanceByePlayerToNextRound(matchId, playerId) {
    const match = await prisma.bracketMatch.findUnique({
      where: { id: matchId },
      include: { bracket: true }
    });

    if (match.nextMatchId) {
      const nextMatch = await prisma.bracketMatch.findUnique({
        where: { id: match.nextMatchId }
      });

      // Assign to first available slot
      const updateData = {};
      if (!nextMatch.player1Id) {
        updateData.player1Id = playerId;
      } else {
        updateData.player2Id = playerId;
      }

      // Determine new status
      const newPlayer1Id = updateData.player1Id || nextMatch.player1Id;
      const newPlayer2Id = updateData.player2Id || nextMatch.player2Id;
      const newStatus = newPlayer1Id && newPlayer2Id ? 'PENDING' : 'WAITING_FOR_PLAYERS';

      await prisma.bracketMatch.update({
        where: { id: match.nextMatchId },
        data: { ...updateData, status: newStatus }
      });

      console.log(`Bye player ${playerId} advanced to next round match ${match.nextMatchId}`);
    }
  }



  /**
   * Calculate number of rounds needed based on player count (legacy method)
   */
  calculateRounds(playerCount) {
    return Math.ceil(Math.log2(playerCount));
  }

  /**
   * Shuffle array for random seeding (legacy method - not used in new implementation)
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