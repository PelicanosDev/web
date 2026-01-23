const Tournament = require('../models/Tournament');
const User = require('../models/User');

// Registrar participante en torneo
exports.registerForTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamName, partner } = req.body;
    const userId = req.user.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Verificar si la inscripción está abierta
    console.log('Tournament registration check:', {
      status: tournament.status,
      registrationDeadline: tournament.dates.registrationDeadline,
      now: new Date(),
      participantsCount: tournament.participants.length,
      maxTeams: tournament.maxTeams,
      canRegister: tournament.canRegister()
    });

    if (!tournament.canRegister()) {
      const now = new Date();
      const deadline = new Date(tournament.dates.registrationDeadline);
      let reason = '';
      
      if (now >= deadline) {
        reason = 'Registration deadline has passed';
      } else if (tournament.participants.length >= tournament.maxTeams) {
        reason = 'Tournament is full';
      } else if (tournament.status !== 'registration' && tournament.status !== 'upcoming') {
        reason = `Tournament status is ${tournament.status}`;
      }
      
      return res.status(400).json({ 
        message: `Registration is closed: ${reason}`,
        details: {
          status: tournament.status,
          deadline: tournament.dates.registrationDeadline,
          participants: tournament.participants.length,
          maxTeams: tournament.maxTeams
        }
      });
    }

    // Verificar si el usuario ya está registrado
    const alreadyRegistered = tournament.participants.some(
      p => p.user && p.user.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ 
        message: 'You are already registered for this tournament' 
      });
    }

    // Crear participante
    const participant = {
      user: userId,
      teamName,
      partner: {
        ...partner,
        isMember: partner.userId ? true : false
      },
      status: tournament.requiresApproval ? 'pending' : 'confirmed'
    };

    tournament.participants.push(participant);
    
    // Verificar si se alcanzó el máximo de equipos y generar bracket automáticamente
    if (tournament.participants.length >= tournament.maxTeams) {
      console.log('Tournament is full, generating bracket automatically...');
      const confirmedParticipants = tournament.participants.filter(p => p.status === 'confirmed');
      
      if (confirmedParticipants.length >= 2) {
        const result = generateSingleEliminationBracket(confirmedParticipants);
        tournament.bracket = result.bracket;
        tournament.matches = result.matches;
        tournament.status = 'in-progress';
        console.log(`Bracket generated with ${result.matches.length} matches`);
      }
    }
    
    await tournament.save();

    await tournament.populate('participants.user', 'profile email');
    await tournament.populate('participants.partner.userId', 'profile email');

    res.status(201).json({
      success: true,
      message: tournament.requiresApproval 
        ? 'Registration submitted for approval' 
        : 'Successfully registered for tournament',
      data: tournament
    });
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ 
      message: 'Error registering for tournament',
      error: error.message 
    });
  }
};

// Cancelar inscripción
exports.cancelRegistration = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const participantIndex = tournament.participants.findIndex(
      p => p.user && p.user.toString() === userId
    );

    if (participantIndex === -1) {
      return res.status(404).json({ 
        message: 'You are not registered for this tournament' 
      });
    }

    // No permitir cancelación si el torneo ya comenzó
    if (tournament.status === 'in-progress' || tournament.status === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot cancel registration after tournament has started' 
      });
    }

    tournament.participants.splice(participantIndex, 1);
    await tournament.save();

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      data: tournament
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ 
      message: 'Error cancelling registration',
      error: error.message 
    });
  }
};

// Obtener participantes de un torneo
exports.getTournamentParticipants = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.user', 'profile email')
      .populate('participants.partner.userId', 'profile email');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json({
      success: true,
      data: {
        participants: tournament.participants,
        totalParticipants: tournament.participants.length,
        maxTeams: tournament.maxTeams,
        registrationOpen: tournament.canRegister()
      }
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ 
      message: 'Error fetching participants',
      error: error.message 
    });
  }
};

// Obtener bracket/llaves del torneo
exports.getTournamentBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.user', 'profile')
      .populate('participants.partner.userId', 'profile');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json({
      success: true,
      data: {
        bracket: tournament.bracket,
        matches: tournament.matches,
        participants: tournament.participants
      }
    });
  } catch (error) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({ 
      message: 'Error fetching bracket',
      error: error.message 
    });
  }
};

// Admin: Generar bracket
exports.generateBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.user', 'profile');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const confirmedParticipants = tournament.participants.filter(
      p => p.status === 'confirmed'
    );

    if (confirmedParticipants.length < 2) {
      return res.status(400).json({ 
        message: 'Need at least 2 confirmed participants to generate bracket' 
      });
    }

    // Generar bracket según modalidad
    let bracket;
    let matches = [];

    if (tournament.modality === 'single-elimination') {
      const result = generateSingleEliminationBracket(confirmedParticipants);
      bracket = result.bracket;
      matches = result.matches;
    } else if (tournament.modality === 'double-elimination') {
      const result = generateDoubleEliminationBracket(confirmedParticipants);
      bracket = result.bracket;
      matches = result.matches;
    } else if (tournament.modality === 'round-robin') {
      const result = generateRoundRobinBracket(confirmedParticipants);
      bracket = result.bracket;
      matches = result.matches;
    }

    tournament.bracket = bracket;
    tournament.matches = matches;
    tournament.status = 'in-progress';
    await tournament.save();

    res.json({
      success: true,
      message: 'Bracket generated successfully',
      data: {
        bracket: tournament.bracket,
        matches: tournament.matches
      }
    });
  } catch (error) {
    console.error('Error generating bracket:', error);
    res.status(500).json({ 
      message: 'Error generating bracket',
      error: error.message 
    });
  }
};

// Función auxiliar para generar bracket de eliminación simple completo
function generateSingleEliminationBracket(participants) {
  const numParticipants = participants.length;
  const totalRounds = Math.ceil(Math.log2(numParticipants));
  
  const bracket = {
    type: 'single-elimination',
    rounds: totalRounds,
    participants: participants.map((p, index) => ({
      id: p._id,
      teamName: p.teamName,
      seed: index + 1
    }))
  };

  const matches = [];
  let matchNumber = 1;
  
  // Nombres de rondas según número de equipos
  const getRoundName = (roundNum, totalRounds) => {
    const remaining = totalRounds - roundNum + 1;
    if (remaining === 1) return 'Final';
    if (remaining === 2) return 'Semifinales';
    if (remaining === 3) return 'Cuartos de Final';
    if (remaining === 4) return 'Octavos de Final';
    return `Ronda ${roundNum}`;
  };

  // Generar todas las rondas
  let currentRoundTeams = participants.map(p => ({
    participantId: p._id,
    teamName: p.teamName
  }));
  
  for (let round = 1; round <= totalRounds; round++) {
    const roundName = getRoundName(round, totalRounds);
    const matchesInRound = Math.floor(currentRoundTeams.length / 2);
    const nextRoundTeams = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      const team1Index = i * 2;
      const team2Index = i * 2 + 1;
      
      matches.push({
        round: roundName,
        roundNumber: round,
        matchNumber: matchNumber++,
        team1: {
          participantId: currentRoundTeams[team1Index]?.participantId || null,
          teamName: currentRoundTeams[team1Index]?.teamName || 'TBD',
          score: []
        },
        team2: {
          participantId: currentRoundTeams[team2Index]?.participantId || null,
          teamName: currentRoundTeams[team2Index]?.teamName || 'TBD',
          score: []
        },
        winner: null,
        status: round === 1 ? 'pending' : 'waiting',
        nextMatchNumber: round < totalRounds ? matchNumber + matchesInRound - i - 1 : null
      });
      
      // Placeholder para siguiente ronda
      nextRoundTeams.push({ participantId: null, teamName: 'TBD' });
    }
    
    currentRoundTeams = nextRoundTeams;
  }

  return { bracket, matches };
}

// Función auxiliar para generar bracket de doble eliminación
function generateDoubleEliminationBracket(participants) {
  const bracket = {
    type: 'double-elimination',
    upperBracket: [],
    lowerBracket: [],
    participants: participants.map((p, index) => ({
      id: p._id,
      teamName: p.teamName,
      seed: index + 1
    }))
  };

  const matches = [];
  // Similar a single elimination pero con bracket de perdedores
  
  return { bracket, matches };
}

// Función auxiliar para generar bracket round-robin
function generateRoundRobinBracket(participants) {
  const bracket = {
    type: 'round-robin',
    participants: participants.map((p, index) => ({
      id: p._id,
      teamName: p.teamName,
      wins: 0,
      losses: 0,
      points: 0
    }))
  };

  const matches = [];
  let matchNumber = 1;

  // Generar todos los enfrentamientos posibles
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      matches.push({
        round: 'Round Robin',
        matchNumber: matchNumber++,
        team1: {
          participantId: participants[i]._id,
          teamName: participants[i].teamName,
          score: []
        },
        team2: {
          participantId: participants[j]._id,
          teamName: participants[j].teamName,
          score: []
        },
        status: 'pending'
      });
    }
  }

  return { bracket, matches };
}

// Admin: Aprobar/rechazar inscripción
exports.updateParticipantStatus = async (req, res) => {
  try {
    const { tournamentId, participantId } = req.params;
    const { status } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const participant = tournament.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = status;
    await tournament.save();

    res.json({
      success: true,
      message: `Participant ${status} successfully`,
      data: tournament
    });
  } catch (error) {
    console.error('Error updating participant status:', error);
    res.status(500).json({ 
      message: 'Error updating participant status',
      error: error.message 
    });
  }
};
