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
