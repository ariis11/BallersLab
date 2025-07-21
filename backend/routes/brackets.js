const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const auth = require('../middleware/auth');
const bracketGenerationService = require('../services/bracketGenerationService');
const bracketMatchService = require('../services/bracketMatchService');
const { body, validationResult } = require('express-validator');

/**
 * Generate bracket for a tournament
 * POST /api/brackets/generate-bracket/:tournamentId
 */
router.post('/generate-bracket/:tournamentId', auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Check if user is tournament creator or admin
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { participants: true }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to generate bracket for this tournament' });
    }

    if (tournament.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Tournament must be in progress to generate bracket' });
    }

    const bracket = await bracketGenerationService.generateBracket(tournamentId);
    
    res.json({
      success: true,
      message: 'Bracket generated successfully',
      bracket
    });
  } catch (error) {
    console.error('Error generating bracket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get complete bracket for a tournament
 * GET /api/brackets/bracket/:tournamentId
 */
router.get('/bracket/:tournamentId', auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Check if user is participant in tournament
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: req.user.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this tournament bracket' });
    }

    const bracket = await bracketMatchService.getBracketForTournament(tournamentId);
    
    res.json({
      success: true,
      bracket
    });
  } catch (error) {
    console.error('Error getting bracket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get specific match details
 * GET /api/brackets/match-details/:tournamentId/:matchId
 */
router.get('/match-details/:tournamentId/:matchId', auth, async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    
    // Check if user is participant in tournament
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: req.user.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this match' });
    }

    const match = await bracketMatchService.getMatchDetails(matchId);
    
    res.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Submit score for a match
 * POST /api/brackets/submit-score/:tournamentId/:matchId
 */
router.post('/submit-score/:tournamentId/:matchId', 
  auth,
  [
    body('score1').isInt({ min: 0 }).withMessage('Score 1 must be a non-negative integer'),
    body('score2').isInt({ min: 0 }).withMessage('Score 2 must be a non-negative integer'),
    body('score1').custom((value, { req }) => {
      if (value === req.body.score2) {
        throw new Error('Scores cannot be equal in basketball');
      }
      return true;
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tournamentId, matchId } = req.params;
      const { score1, score2 } = req.body;
      
      // Check if user is participant in tournament
      const participant = await prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_userId: {
            tournamentId,
            userId: req.user.id
          }
        }
      });

      if (!participant) {
        return res.status(403).json({ error: 'Not authorized to submit scores for this tournament' });
      }

      const match = await bracketMatchService.submitMatchScore(matchId, req.user.id, score1, score2);
      
      res.json({
        success: true,
        message: 'Score submitted successfully',
        match
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get matches for a specific round
 * GET /api/brackets/round-matches/:tournamentId/:roundNumber
 */
router.get('/round-matches/:tournamentId/:roundNumber', auth, async (req, res) => {
  try {
    const { tournamentId, roundNumber } = req.params;
    
    // Check if user is participant in tournament
    const participant = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: req.user.id
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this tournament bracket' });
    }

    const bracket = await bracketMatchService.getBracketForTournament(tournamentId);
    const round = bracket.rounds.find(r => r.roundNumber === parseInt(roundNumber));
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    
    res.json({
      success: true,
      round
    });
  } catch (error) {
    console.error('Error getting round matches:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 