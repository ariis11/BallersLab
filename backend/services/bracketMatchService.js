const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BracketMatchService {
  /**
   * Get complete bracket data for a tournament
   */
  async getBracketForTournament(tournamentId) {
    try {
      const bracket = await prisma.tournamentBracket.findUnique({
        where: { tournamentId },
        include: {
          tournament: {
            select: {
              status: true
            }
          },
          matches: {
            include: {
              player1: {
                include: {
                  profile: true
                }
              },
              player2: {
                include: {
                  profile: true
                }
              },
              winner: {
                include: {
                  profile: true
                }
              },
              submissions: {
                include: {
                  submitter: {
                    include: {
                      profile: true
                    }
                  }
                }
              },

            },
            orderBy: [
              { roundNumber: 'asc' },
              { matchNumber: 'asc' }
            ]
          }
        }
      });

      if (!bracket) {
        throw new Error('Bracket not found for this tournament');
      }

      return this.formatBracketData(bracket);
    } catch (error) {
      console.error('Error getting bracket:', error);
      throw error;
    }
  }

  /**
   * Get specific match details
   */
  async getMatchDetails(matchId) {
    try {
      const match = await prisma.bracketMatch.findUnique({
        where: { id: matchId },
        include: {
          player1: {
            include: {
              profile: true
            }
          },
          player2: {
            include: {
              profile: true
            }
          },
          winner: {
            include: {
              profile: true
            }
          },
          submissions: {
            include: {
              submitter: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      return this.formatMatchData(match);
    } catch (error) {
      console.error('Error getting match details:', error);
      throw error;
    }
  }

  /**
   * Submit score for a match
   */
  async submitMatchScore(matchId, playerId, score1, score2) {
    try {
      const match = await prisma.bracketMatch.findUnique({
        where: { id: matchId },
        include: {
          submissions: true
        }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // Validate player is in this match
      if (match.player1Id !== playerId && match.player2Id !== playerId) {
        throw new Error('Not authorized to submit score for this match');
      }

      // Check if player already submitted
      const existingSubmission = match.submissions.find(s => s.submittedBy === playerId);
      if (existingSubmission && match.status !== 'DISPUTED') {
        throw new Error('Already submitted score for this match');
      }

      // Validate match status
      if (!['PENDING', 'SUBMITTED', 'DISPUTED'].includes(match.status)) {
        throw new Error('Match is not ready for score submission');
      }

      // If match is disputed and player already submitted, update their submission
      if (match.status === 'DISPUTED' && existingSubmission) {
        await prisma.bracketMatchSubmission.update({
          where: { id: existingSubmission.id },
          data: { score1, score2, submittedAt: new Date() }
        });
      } else {
        // Create submission
        await prisma.bracketMatchSubmission.create({
          data: {
            matchId,
            submittedBy: playerId,
            score1,
            score2
          }
        });
      }

      // Check if both players submitted
      const submissions = await prisma.bracketMatchSubmission.findMany({
        where: { matchId }
      });

      if (submissions.length === 2) {
        // Both players submitted - check if scores match
        const [submission1, submission2] = submissions;
        if (submission1.score1 === submission2.score1 && submission1.score2 === submission2.score2) {
          // Scores match - confirm match
          await this.confirmMatch(matchId, submission1.score1, submission1.score2);
        } else {
          // Scores don't match - mark as disputed and delete all submissions
          await prisma.bracketMatch.update({
            where: { id: matchId },
            data: { status: 'DISPUTED' }
          });
          await prisma.bracketMatchSubmission.deleteMany({ where: { matchId } });
        }
      } else {
        // First submission or resubmission
        await prisma.bracketMatch.update({
          where: { id: matchId },
          data: { status: 'SUBMITTED' }
        });
      }

      return this.getMatchDetails(matchId);
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * Confirm match and advance winner
   */
  async confirmMatch(matchId, score1, score2) {
    try {
      const match = await prisma.bracketMatch.findUnique({
        where: { id: matchId },
        include: {
          player1: true,
          player2: true,
          bracket: true
        }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // Determine winner
      const winnerId = score1 > score2 ? match.player1Id : match.player2Id;
      const loserId = score1 > score2 ? match.player2Id : match.player1Id;

      // Update match
      await prisma.bracketMatch.update({
        where: { id: matchId },
        data: {
          status: 'CONFIRMED',
          winnerId
        }
      });

      // Mark loser as eliminated and calculate points
      if (loserId) {
        const pointsEarned = this.calculateScore(match.roundNumber);
        
        await prisma.tournamentParticipant.updateMany({
          where: {
            userId: loserId,
            tournamentId: match.bracket.tournamentId
          },
          data: {
            eliminatedInRound: match.roundNumber,
            points_earned: pointsEarned,
            status: 'ELIMINATED'
          }
        });
      }

      // Advance winner to next round
      if (match.nextMatchId) {
        await this.advanceWinnerToNextRound(match.nextMatchId, winnerId);
      } else {
        // This is the final match - complete the tournament
        await this.completeTournament(match.bracket.tournamentId, winnerId, match.roundNumber);
      }

      return this.getMatchDetails(matchId);
    } catch (error) {
      console.error('Error confirming match:', error);
      throw error;
    }
  }

  /**
   * Advance winner to next round match
   */
  async advanceWinnerToNextRound(nextMatchId, winnerId) {
    try {
      const nextMatch = await prisma.bracketMatch.findUnique({
        where: { id: nextMatchId }
      });

      if (!nextMatch) {
        throw new Error('Next match not found');
      }

      // Check if next match already has both players (from byes)
      if (nextMatch.player1Id && nextMatch.player2Id) {
        throw new Error('Next match already has both players');
      }

      // Determine which player slot to fill
      let updateData = {};
      if (!nextMatch.player1Id) {
        updateData.player1Id = winnerId;
      } else if (!nextMatch.player2Id) {
        updateData.player2Id = winnerId;
      } else {
        throw new Error('Next match already has both players');
      }

      // Determine the new status based on updated player assignments
      const newPlayer1Id = updateData.player1Id || nextMatch.player1Id;
      const newPlayer2Id = updateData.player2Id || nextMatch.player2Id;
      const newStatus = newPlayer1Id && newPlayer2Id ? 'PENDING' : 'WAITING_FOR_PLAYERS';

      // Update next match
      await prisma.bracketMatch.update({
        where: { id: nextMatchId },
        data: {
          ...updateData,
          status: newStatus
        }
      });

      console.log(`Winner ${winnerId} advanced to next round match ${nextMatchId}`);
    } catch (error) {
      console.error('Error advancing winner:', error);
      throw error;
    }
  }

  /**
   * Complete tournament when final match is finished
   */
  async completeTournament(tournamentId, winnerId, finalRoundNumber) {
    try {
      // Calculate points for winner
      const winnerPoints = this.calculateScore(finalRoundNumber + 1);

      // Update winner first
      await prisma.tournamentParticipant.update({
        where: {
          tournamentId_userId: {
            tournamentId,
            userId: winnerId
          }
        },
        data: {
          status: 'WINNER',
          finalRank: 1,
          eliminatedInRound: null,
          points_earned: winnerPoints
        }
      });

      // Update tournament status
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED' }
      });

      // Get tournament with updated participant data
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      // Update user points for ALL participants (now with correct data)
      if (tournament.ageGroup) {
        const userPointsUpdates = [];
        
        for (const participant of tournament.participants) {
          const pointsEarned = participant.points_earned || 0;
          if (pointsEarned > 0) {
            userPointsUpdates.push(
              this.updateUserPoints(participant.userId, tournament.ageGroup, pointsEarned)
            );
          }
        }

        // Execute user points updates
        if (userPointsUpdates.length > 0) {
          await prisma.$transaction(userPointsUpdates);
        }
      }

      console.log(`🏆 Tournament ${tournamentId} completed! Winner: ${winnerId} (${winnerPoints} pts)`);
    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }



  /**
   * Update user points for a specific age group
   */
  updateUserPoints(userId, ageGroup, points) {
    return prisma.userPoints.upsert({
      where: {
        userId_ageGroup: {
          userId,
          ageGroup
        }
      },
      update: {
        points: { increment: points },
        tournamentsPlayed: { increment: 1 }
      },
      create: {
        userId,
        ageGroup,
        points,
        tournamentsPlayed: 1
      }
    });
  }

  /**
   * Get point allocations based on tournament size
   */
  /**
   * Calculate points based on which round a player lost
   */
  calculateScore(roundLostIn) {
    return Math.round(20 * Math.pow(1.6, roundLostIn - 1));
  }



  /**
   * Format bracket data for frontend
   */
  formatBracketData(bracket) {
    const rounds = [];
    
    for (let roundNum = 1; roundNum <= bracket.totalRounds; roundNum++) {
      const roundMatches = bracket.matches.filter(m => m.roundNumber === roundNum);
      
      rounds.push({
        roundNumber: roundNum,
        roundName: this.getRoundName(roundNum, bracket.totalRounds),
        matches: roundMatches.map(match => this.formatMatchData(match))
      });
    }

    return {
      id: bracket.id,
      tournamentId: bracket.tournamentId,
      totalRounds: bracket.totalRounds,
      totalPlayers: bracket.totalPlayers,
      tournamentStatus: bracket.tournament?.status || 'UNKNOWN',
      rounds
    };
  }

  /**
   * Format match data for frontend
   */
  formatMatchData(match) {
    const submissions = match.submissions || [];
    const player1Submission = submissions.find(s => s.submittedBy === match.player1Id);
    const player2Submission = submissions.find(s => s.submittedBy === match.player2Id);

    // Handle bye matches
    const isByeMatch = match.status === 'BYE';
    const player2Data = isByeMatch ? {
      id: null,
      name: '(Bye)',
      avatar: null
    } : (match.player2 ? {
      id: match.player2.id,
      name: match.player2.profile?.firstName || match.player2.email,
      avatar: match.player2.profile?.avatar
    } : null);

    return {
      id: match.id,
      roundNumber: match.roundNumber,
      matchNumber: match.matchNumber,
      player1: match.player1 ? {
        id: match.player1.id,
        name: match.player1.profile?.firstName || match.player1.email,
        avatar: match.player1.profile?.avatar
      } : null,
      player2: player2Data,
      status: match.status,
      winnerId: match.winnerId,
      confirmedScore1: player1Submission?.score1,
      confirmedScore2: player1Submission?.score2,
      player1Submission: player1Submission ? {
        score1: player1Submission.score1,
        score2: player1Submission.score2,
        submittedAt: player1Submission.submittedAt
      } : null,
      player2Submission: player2Submission ? {
        score1: player2Submission.score1,
        score2: player2Submission.score2,
        submittedAt: player2Submission.submittedAt
      } : null
    };
  }

  /**
   * Get round name based on round number and total rounds
   */
  getRoundName(roundNumber, totalRounds) {
    const roundNames = [
      'FINAL',
      'SEMI-FINALS', 
      'QUARTER-FINALS',
      '1/8-FINALS',
      '1/16-FINALS',
      '1/32-FINALS',
      '1/64-FINALS',
      '1/128-FINALS'
    ];

    // Calculate which round this is from the end (0 = final, 1 = semi-finals, etc.)
    const roundsFromEnd = totalRounds - roundNumber;
    
    return roundNames[roundsFromEnd] || `ROUND ${roundNumber}`;
  }
}

module.exports = new BracketMatchService(); 