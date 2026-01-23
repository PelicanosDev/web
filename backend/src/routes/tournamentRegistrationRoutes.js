const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  registerForTournament,
  cancelRegistration,
  getTournamentParticipants,
  getTournamentBracket,
  generateBracket,
  updateParticipantStatus
} = require('../controllers/tournamentRegistrationController');

// Rutas públicas
router.get('/:tournamentId/participants', getTournamentParticipants);
router.get('/:tournamentId/bracket', getTournamentBracket);

// Rutas protegidas para miembros
router.post('/:tournamentId/register', authenticate, registerForTournament);
router.delete('/:tournamentId/register', authenticate, cancelRegistration);

// Rutas de administrador
router.post('/:tournamentId/generate-bracket', authenticate, authorize('admin', 'coach'), generateBracket);
router.patch('/:tournamentId/participants/:participantId/status', authenticate, authorize('admin', 'coach'), updateParticipantStatus);

module.exports = router;
