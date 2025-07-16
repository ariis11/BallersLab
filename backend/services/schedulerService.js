const cron = require('cron');
const tournamentStatusService = require('./tournamentStatusService');

class SchedulerService {
  constructor() {
    this.statusUpdateJob = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the simple scheduler
   */
  initialize() {
    if (this.isInitialized) {
      console.log('Simple scheduler already initialized');
      return;
    }

    console.log('🚀 Initializing simple tournament status scheduler...');

    // Create the status update job (every 2 minutes)
    this.statusUpdateJob = new cron.CronJob(
      '*/2 * * * *', // Every 2 minutes
      async () => {
        console.log(`\n🕐 [${new Date().toISOString()}] Running scheduled status updates...`);
        try {
          await tournamentStatusService.updateAllTournamentStatuses();
        } catch (error) {
          console.error('❌ Error in scheduled status update:', error);
        }
      },
      null,
      false, // Don't start immediately
      'UTC'
    );

    this.statusUpdateJob.start();
    this.isInitialized = true;
    console.log('✅ Simple tournament status scheduler initialized (every 2 minutes)');
  }

  /**
   * Manually trigger status updates
   */
  async triggerManualUpdate() {
    console.log('🔧 Triggering manual status update...');
    try {
      const result = await tournamentStatusService.updateAllTournamentStatuses();
      console.log('✅ Manual update completed');
      return result;
    } catch (error) {
      console.error('❌ Error in manual update:', error);
      throw error;
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('🛑 Stopping simple tournament status scheduler...');
    
    if (this.statusUpdateJob) {
      this.statusUpdateJob.stop();
      this.statusUpdateJob = null;
    }
    
    this.isInitialized = false;
    console.log('✅ Simple tournament status scheduler stopped');
  }
}

module.exports = new SchedulerService(); 