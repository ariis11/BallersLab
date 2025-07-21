const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const auth = require('../middleware/auth');
const bracketGenerationService = require('../services/bracketGenerationService');
const bracketMatchService = require('../services/bracketMatchService');
const { body, validationResult } = require('express-validator');

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

module.exports = router; 