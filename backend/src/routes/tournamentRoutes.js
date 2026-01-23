const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerTeam
} = require('../controllers/tournamentController');

const {
  registerForTournament,
  cancelRegistration,
  getTournamentParticipants,
  getTournamentBracket,
  generateBracket,
  updateParticipantStatus
} = require('../controllers/tournamentRegistrationController');

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);

// Rutas de inscripción (públicas y protegidas)
router.get('/:tournamentId/participants', getTournamentParticipants);
router.get('/:tournamentId/bracket', getTournamentBracket);
router.post('/:tournamentId/register', authenticate, registerForTournament);
router.delete('/:tournamentId/register', authenticate, cancelRegistration);
router.post('/:tournamentId/generate-bracket', authenticate, authorize('admin', 'coach'), generateBracket);
router.patch('/:tournamentId/participants/:participantId/status', authenticate, authorize('admin', 'coach'), updateParticipantStatus);

// Ruta legacy de registro de equipos
router.post('/:id/register-team', authenticate, registerTeam);

router.use(authenticate);
router.use(authorize('admin', 'coach'));

router.post('/', upload.single('coverImage'), createTournament);
router.put('/:id', upload.single('coverImage'), updateTournament);
router.delete('/:id', deleteTournament);

module.exports = router;
