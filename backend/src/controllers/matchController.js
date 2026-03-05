const Tournament = require('../models/Tournament');

// Actualizar resultado de un partido
exports.updateMatchResult = async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    const { team1Score, team2Score, winnerId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const match = tournament.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Actualizar scores
    match.team1.score = team1Score;
    match.team2.score = team2Score;
    match.winner = winnerId;
    match.status = 'completed';

    // Si hay siguiente partido, actualizar el ganador
    if (match.nextMatchNumber) {
      const nextMatch = tournament.matches.find(m => m.matchNumber === match.nextMatchNumber);
      if (nextMatch) {
        const winnerTeam = winnerId.toString() === match.team1.participantId?.toString() 
          ? match.team1 
          : match.team2;
        
        // Determinar si va a team1 o team2 del siguiente partido
        if (!nextMatch.team1.participantId) {
          nextMatch.team1.participantId = winnerTeam.participantId;
          nextMatch.team1.teamName = winnerTeam.teamName;
        } else if (!nextMatch.team2.participantId) {
          nextMatch.team2.participantId = winnerTeam.participantId;
          nextMatch.team2.teamName = winnerTeam.teamName;
        }
        
        // Si ambos equipos están definidos, el partido está listo
        if (nextMatch.team1.participantId && nextMatch.team2.participantId) {
          nextMatch.status = 'pending';
        }
      }
    }

    // Para round-robin, actualizar tabla de posiciones
    if (tournament.modality === 'round-robin' && tournament.bracket) {
      const winnerParticipant = tournament.bracket.participants.find(
        p => p.id.toString() === winnerId.toString()
      );
      const loserParticipant = tournament.bracket.participants.find(
        p => p.id.toString() !== winnerId.toString() &&
           (p.id.toString() === match.team1.participantId?.toString() ||
            p.id.toString() === match.team2.participantId?.toString())
      );

      if (winnerParticipant) {
        winnerParticipant.wins = (winnerParticipant.wins || 0) + 1;
        winnerParticipant.points = (winnerParticipant.points || 0) + 3;
      }
      if (loserParticipant) {
        loserParticipant.losses = (loserParticipant.losses || 0) + 1;
      }
    }

    // Actualizar standings de fase de grupos
    if (tournament.hasGroups && tournament.groups && tournament.groups.length > 0) {
      const group = tournament.groups.find(g => g.name === match.round);
      if (group) {
        const p1 = group.participants.find(
          p => p.participantId?.toString() === match.team1.participantId?.toString()
        );
        const p2 = group.participants.find(
          p => p.participantId?.toString() === match.team2.participantId?.toString()
        );

        if (p1 && p2) {
          const cfg = tournament.groupConfig || {};
          const pointsCfg = cfg.pointsConfig || { win2_0: 3, win2_1: 2, lose2_1: 1, lose2_0: 0 };
          const coeffType = cfg.coefficientType || 'sets';

          const team1SetsWon = match.team1.score.filter((s, i) => s > (match.team2.score[i] || 0)).length;
          const team2SetsWon = match.team2.score.filter((s, i) => s > (match.team1.score[i] || 0)).length;
          const team1TotalPts = match.team1.score.reduce((a, b) => a + b, 0);
          const team2TotalPts = match.team2.score.reduce((a, b) => a + b, 0);

          const team1Won = winnerId.toString() === match.team1.participantId?.toString();
          const winnerSets = team1Won ? team1SetsWon : team2SetsWon;
          const loserSets  = team1Won ? team2SetsWon : team1SetsWon;
          const isClean = loserSets === 0; // 2-0

          // Actualizar p1
          p1.played++;
          p1.setsFor     += team1SetsWon;
          p1.setsAgainst += team2SetsWon;
          p1.pointsFor     += team1TotalPts;
          p1.pointsAgainst += team2TotalPts;
          if (team1Won) {
            p1.wins++;
            p1.points += isClean ? (pointsCfg.win2_0 ?? 3) : (pointsCfg.win2_1 ?? 2);
          } else {
            p1.losses++;
            p1.points += isClean ? (pointsCfg.lose2_0 ?? 0) : (pointsCfg.lose2_1 ?? 1);
          }
          p1.coefficient = coeffType === 'sets'
            ? p1.setsFor / Math.max(p1.setsAgainst, 1)
            : p1.pointsFor / Math.max(p1.pointsAgainst, 1);

          // Actualizar p2 (inverso)
          const team2Won = !team1Won;
          const isClean2 = team1SetsWon === 0; // p2 ganó 2-0
          p2.played++;
          p2.setsFor     += team2SetsWon;
          p2.setsAgainst += team1SetsWon;
          p2.pointsFor     += team2TotalPts;
          p2.pointsAgainst += team1TotalPts;
          if (team2Won) {
            p2.wins++;
            p2.points += isClean2 ? (pointsCfg.win2_0 ?? 3) : (pointsCfg.win2_1 ?? 2);
          } else {
            p2.losses++;
            p2.points += isClean2 ? (pointsCfg.lose2_0 ?? 0) : (pointsCfg.lose2_1 ?? 1);
          }
          p2.coefficient = coeffType === 'sets'
            ? p2.setsFor / Math.max(p2.setsAgainst, 1)
            : p2.pointsFor / Math.max(p2.pointsAgainst, 1);

          // ¿El grupo está completo?
          const n = group.participants.length;
          const totalGroupMatches = (n * (n - 1)) / 2;
          const completedGroupMatches = tournament.matches.filter(
            m => m.round === group.name && m.status === 'completed'
          ).length;

          if (completedGroupMatches >= totalGroupMatches) {
            group.complete = true;
            // Asignar ranks con tiebreakers
            const method = cfg.classificationMethod || 'points';
            const sorted = rankGroupParticipants(group.participants, method, group.name, tournament);
            sorted.forEach((p, idx) => { p.rank = idx + 1; });
          }

          // ¿Todos los grupos completos?
          if (tournament.groups.every(g => g.complete)) {
            tournament.groupPhaseComplete = true;
          }

          tournament.markModified('groups');
        }
      }
    }

    await tournament.save();

    res.json({
      success: true,
      message: 'Match result updated successfully',
      data: tournament
    });
  } catch (error) {
    console.error('Error updating match result:', error);
    res.status(500).json({ 
      message: 'Error updating match result',
      error: error.message 
    });
  }
};

// Obtener estadísticas del torneo
exports.getTournamentStats = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.user', 'profile');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const stats = {
      totalParticipants: tournament.participants.length,
      totalMatches: tournament.matches.length,
      completedMatches: tournament.matches.filter(m => m.status === 'completed').length,
      pendingMatches: tournament.matches.filter(m => m.status === 'pending').length,
      inProgressMatches: tournament.matches.filter(m => m.status === 'in-progress').length,
      currentRound: getCurrentRound(tournament),
      standings: tournament.modality === 'round-robin' ? tournament.bracket?.participants : null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching tournament stats:', error);
    res.status(500).json({ 
      message: 'Error fetching tournament stats',
      error: error.message 
    });
  }
};

// Iniciar un partido
exports.startMatch = async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const match = tournament.matches.id(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    match.status = 'in-progress';
    await tournament.save();

    res.json({
      success: true,
      message: 'Match started successfully',
      data: match
    });
  } catch (error) {
    console.error('Error starting match:', error);
    res.status(500).json({ 
      message: 'Error starting match',
      error: error.message 
    });
  }
};

// Obtener tabla de posiciones (para round-robin)
exports.getStandings = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.user', 'profile');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.modality !== 'round-robin') {
      return res.status(400).json({ 
        message: 'Standings are only available for round-robin tournaments' 
      });
    }

    const standings = tournament.bracket?.participants || [];
    
    // Ordenar por puntos, luego por victorias
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    res.json({
      success: true,
      data: standings
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ 
      message: 'Error fetching standings',
      error: error.message 
    });
  }
};

// Función auxiliar para rankear participantes de un grupo con tiebreakers
function rankGroupParticipants(participants, method, groupName, tournament) {
  return [...participants].sort((a, b) => {
    const primaryA = method === 'points' ? a.points : a.coefficient;
    const primaryB = method === 'points' ? b.points : b.coefficient;
    if (primaryB !== primaryA) return primaryB - primaryA;

    const secondaryA = method === 'points' ? a.coefficient : a.points;
    const secondaryB = method === 'points' ? b.coefficient : b.points;
    if (secondaryB !== secondaryA) return secondaryB - secondaryA;

    // Desempate por enfrentamiento directo
    const h2h = tournament.matches.find(m =>
      m.round === groupName &&
      m.status === 'completed' &&
      ((m.team1.participantId?.toString() === a.participantId?.toString() &&
        m.team2.participantId?.toString() === b.participantId?.toString()) ||
       (m.team1.participantId?.toString() === b.participantId?.toString() &&
        m.team2.participantId?.toString() === a.participantId?.toString()))
    );
    if (h2h) {
      return h2h.winner?.toString() === a.participantId?.toString() ? -1 : 1;
    }
    return 0;
  });
}

// Función auxiliar para obtener la ronda actual
function getCurrentRound(tournament) {
  if (!tournament.matches || tournament.matches.length === 0) {
    return null;
  }

  // Encontrar la primera ronda con partidos pendientes o en progreso
  const activeMatch = tournament.matches.find(
    m => m.status === 'pending' || m.status === 'in-progress'
  );

  return activeMatch ? activeMatch.round : 'Completed';
}

module.exports = exports;
