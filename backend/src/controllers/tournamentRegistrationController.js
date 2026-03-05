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

    // Si tiene fase de grupos y aún no está completa, generar grupos
    if (tournament.hasGroups && !tournament.groupPhaseComplete) {
      if (!tournament.groupConfig || !tournament.groupConfig.numGroups) {
        return res.status(400).json({ message: 'Group configuration is missing' });
      }
      const result = generateGroupStage(confirmedParticipants, tournament.groupConfig);
      tournament.groups = result.groups;
      tournament.matches = result.matches;
      tournament.status = 'in-progress';
      await tournament.save();

      return res.json({
        success: true,
        message: 'Group stage generated successfully',
        data: {
          groups: tournament.groups,
          matches: tournament.matches
        }
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

// Admin: Avanzar de fase de grupos a llaves de eliminación
exports.advanceToEliminationBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.groupPhaseComplete) {
      return res.status(400).json({ message: 'Group phase is not complete yet' });
    }

    if (tournament.bracket) {
      return res.status(400).json({ message: 'Elimination bracket already generated' });
    }

    const cfg = tournament.groupConfig;
    const method = cfg.classificationMethod || 'points';

    // Determinar cuántos clasifican en total (potencia de 2 más cercana)
    const numDirect = tournament.groups.length * cfg.teamsToAdvancePerGroup;
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(Math.max(numDirect, 2))));
    const extraNeeded = nextPow2 - numDirect;

    const sortFn = (a, b) => {
      if (method === 'points') {
        if (b.points !== a.points) return b.points - a.points;
        return b.coefficient - a.coefficient;
      }
      if (b.coefficient !== a.coefficient) return b.coefficient - a.coefficient;
      return b.points - a.points;
    };

    // Ranking por tiers: primero todos los 1°, luego todos los 2°, etc.
    // Dentro de cada tier se ordena por el método de clasificación
    const allQualifiers = [];
    for (let tier = 1; tier <= cfg.teamsToAdvancePerGroup; tier++) {
      const tierTeams = [];
      for (const group of tournament.groups) {
        const sorted = rankParticipants(group.participants, method, group.name, tournament);
        if (sorted.length >= tier) {
          tierTeams.push({
            ...sorted[tier - 1].toObject ? sorted[tier - 1].toObject() : sorted[tier - 1],
            groupRank: tier,
            groupName: group.name
          });
        }
      }
      tierTeams.sort(sortFn);
      allQualifiers.push(...tierTeams);
    }

    // Mejores terceros si hacen falta
    if (extraNeeded > 0) {
      const thirdsRank = cfg.teamsToAdvancePerGroup + 1;
      const thirds = [];
      for (const group of tournament.groups) {
        const sorted = rankParticipants(group.participants, method, group.name, tournament);
        if (sorted.length >= thirdsRank) {
          thirds.push({
            ...sorted[thirdsRank - 1].toObject ? sorted[thirdsRank - 1].toObject() : sorted[thirdsRank - 1],
            groupRank: thirdsRank,
            groupName: group.name
          });
        }
      }
      thirds.sort(sortFn);
      allQualifiers.push(...thirds.slice(0, extraNeeded));
    }

    // Seeding en bracket: lado A (1,3,5...) vs lado B (2,4,6...)
    const seeded = bracketSeed(allQualifiers);

    // Construir participantes con la forma que espera generateSingleEliminationBracket
    const bracketParticipants = seeded.map(q => ({
      _id: q.participantId,
      teamName: q.teamName
    }));

    // Offset para que los matchNumbers de las llaves no colisionen con los de grupos
    const matchOffset = tournament.matches.length;
    const result = generateSingleEliminationBracket(bracketParticipants, matchOffset);

    // Mantener los partidos de grupo y agregar los de eliminación
    tournament.matches.push(...result.matches);
    tournament.bracket = result.bracket;
    await tournament.save();

    res.json({
      success: true,
      message: `Elimination bracket generated with ${bracketParticipants.length} teams`,
      data: {
        bracket: tournament.bracket,
        matches: tournament.matches,
        qualifiers: allQualifiers.map((q, i) => ({ seed: i + 1, teamName: q.teamName, groupName: q.groupName, groupRank: q.groupRank }))
      }
    });
  } catch (error) {
    console.error('Error advancing to elimination bracket:', error);
    res.status(500).json({
      message: 'Error advancing to elimination bracket',
      error: error.message
    });
  }
};

// Función auxiliar para generar fase de grupos (round-robin dentro de cada grupo)
function generateGroupStage(participants, groupConfig) {
  const numGroups = groupConfig.numGroups;
  // Distribución balanceada: algunos grupos tienen base+1, el resto base
  const base = Math.floor(participants.length / numGroups);
  const remainder = participants.length % numGroups;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const groups = [];
  const matches = [];
  let matchNumber = 1;
  let offset = 0;

  for (let g = 0; g < numGroups; g++) {
    const groupSize = g < remainder ? base + 1 : base;
    const slice = participants.slice(offset, offset + groupSize);
    offset += groupSize;
    if (slice.length === 0) continue;
    const groupName = `Grupo ${letters[g] || g}`;

    const groupParticipants = slice.map(p => ({
      participantId: p._id,
      teamName: p.teamName,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      setsFor: 0,
      setsAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      coefficient: 0
    }));

    // Round-robin dentro del grupo
    for (let i = 0; i < slice.length; i++) {
      for (let j = i + 1; j < slice.length; j++) {
        matches.push({
          round: groupName,
          roundNumber: g + 1,
          matchNumber: matchNumber++,
          team1: {
            participantId: slice[i]._id,
            teamName: slice[i].teamName,
            score: []
          },
          team2: {
            participantId: slice[j]._id,
            teamName: slice[j].teamName,
            score: []
          },
          winner: null,
          status: 'pending',
          nextMatchNumber: null
        });
      }
    }

    groups.push({ name: groupName, participants: groupParticipants, complete: false });
  }

  return { groups, matches };
}

// Bracket seeding estándar (pliegue recursivo)
// 8 equipos → Lado A: (1vs8)(4vs5) | Lado B: (2vs7)(3vs6)
// 16 equipos → Lado A: (1vs16)(8vs9)(4vs13)(5vs12) | Lado B: (2vs15)(7vs10)(3vs14)(6vs11)
// Garantiza: 1 y 2 solo se cruzan en la final
function bracketSeed(sorted) {
  const n = sorted.length;

  // Genera los índices en el orden de pliegue recursivo
  function buildPositions(size) {
    if (size === 2) return [0, 1];
    const prev = buildPositions(size / 2);
    const result = [];
    for (const pos of prev) {
      result.push(pos);
      result.push(size - 1 - pos); // complementario
    }
    return result;
  }

  return buildPositions(n).map(i => sorted[i]);
}

// Función auxiliar para ordenar participantes de un grupo con tiebreakers
function rankParticipants(participants, method, groupName, tournament) {
  const sorted = [...participants].sort((a, b) => {
    const primaryA = method === 'points' ? a.points : a.coefficient;
    const primaryB = method === 'points' ? b.points : b.coefficient;
    if (primaryB !== primaryA) return primaryB - primaryA;

    const secondaryA = method === 'points' ? a.coefficient : a.points;
    const secondaryB = method === 'points' ? b.coefficient : b.points;
    if (secondaryB !== secondaryA) return secondaryB - secondaryA;

    // Desempate por enfrentamiento directo
    const headToHead = tournament.matches.find(m =>
      m.round === groupName &&
      m.status === 'completed' &&
      ((m.team1.participantId?.toString() === a.participantId?.toString() &&
        m.team2.participantId?.toString() === b.participantId?.toString()) ||
       (m.team1.participantId?.toString() === b.participantId?.toString() &&
        m.team2.participantId?.toString() === a.participantId?.toString()))
    );
    if (headToHead) {
      const aWon = headToHead.winner?.toString() === a.participantId?.toString();
      return aWon ? -1 : 1;
    }
    return 0;
  });
  return sorted;
}

// Función auxiliar para generar bracket de eliminación simple completo
function generateSingleEliminationBracket(participants, matchNumberOffset = 0) {
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
  let matchNumber = matchNumberOffset + 1;
  
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
        nextMatchNumber: round < totalRounds ? matchNumber + matchesInRound - i - 1 + Math.floor(i / 2) : null
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
