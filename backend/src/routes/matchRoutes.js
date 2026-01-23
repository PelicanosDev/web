const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  updateMatchResult,
  getTournamentStats,
  startMatch,
  getStandings
} = require('../controllers/matchController');

// Rutas públicas
router.get('/:tournamentId/stats', getTournamentStats);
router.get('/:tournamentId/standings', getStandings);

// Rutas de administrador
router.patch('/:tournamentId/matches/:matchId/result', authenticate, authorize('admin', 'coach'), updateMatchResult);
router.patch('/:tournamentId/matches/:matchId/start', authenticate, authorize('admin', 'coach'), startMatch);

module.exports = router;
