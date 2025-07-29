const { PrismaClient } = require('@prisma/client');
const bracketGenerationService = require('./bracketGenerationService');
const prisma = new PrismaClient();

class TournamentStatusService {
  /**
   * Update status for all tournaments that need it
   */
  async updateAllTournamentStatuses() {
    try {
      console.log('🔄 Checking tournament statuses...');
      
      const now = new Date();
      
      // Get tournaments that need status updates
      const tournaments = await prisma.tournament.findMany({
        where: {
          status: { notIn: ['CANCELLED', 'COMPLETED'] }
        }
      });

      let updated = 0;
      
      for (const tournament of tournaments) {
        const newStatus = this.determineStatus(tournament, now);
        
        if (newStatus && newStatus !== tournament.status) {
          await prisma.tournament.update({
            where: { id: tournament.id },
            data: { status: newStatus }
          });
          
          console.log(`🔄 Tournament "${tournament.title}" status: ${tournament.status} → ${newStatus}`);
          
          // Generate bracket when tournament starts
          if (newStatus === 'IN_PROGRESS' && !tournament.bracketGenerated) {
            try {
              await bracketGenerationService.generateBracket(tournament.id);
              console.log(`🏆 Bracket generated for tournament "${tournament.title}"`);
            } catch (error) {
              console.error(`❌ Error generating bracket for tournament "${tournament.title}":`, error);
            }
          }
          
          updated++;
        }
      }
      
      console.log(`✅ Updated ${updated} tournaments`);
      return { updated };
      
    } catch (error) {
      console.error('❌ Error updating tournament statuses:', error);
      throw error;
    }
  }

  /**
   * Determine what status a tournament should have
   */
  determineStatus(tournament, now) {
    // Check if tournament should be IN_PROGRESS
    if (tournament.startDate <= now && (tournament.status === 'REGISTRATION_CLOSED' || tournament.status === 'REGISTRATION_OPEN')) {
      if (tournament.currentPlayers < tournament.maxPlayers) {
        return 'CANCELLED';
      }
      return 'IN_PROGRESS';
    }

    // Check if registration should be closed
    if (tournament.status === 'REGISTRATION_OPEN') {
      if (tournament.registrationDeadline && tournament.registrationDeadline <= now) {
        if (tournament.currentPlayers < tournament.maxPlayers) {
          return 'CANCELLED';
        }
        return 'REGISTRATION_CLOSED';
      }

      if (tournament.currentPlayers >= tournament.maxPlayers) {
        return 'REGISTRATION_CLOSED';
      }
    }

    // Check if tournament should be completed (if it's been running for more than 2 days)
    if (tournament.status === 'IN_PROGRESS') {
      const twoDaysAfterStart = new Date(tournament.startDate.getTime() + 48 * 60 * 60 * 1000);
      if (now >= twoDaysAfterStart) {
        return 'CANCELLED';
      }
    }

    return null; // No status change needed
  }

  /**
   * Manually update a tournament's status
   */
  async manualStatusUpdate(tournamentId, newStatus) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId }
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: newStatus }
      });

      console.log(`🔧 Manual update: Tournament ${tournamentId} → ${newStatus}`);
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Error in manual status update:`, error);
      throw error;
    }
  }
}

module.exports = new TournamentStatusService(); 