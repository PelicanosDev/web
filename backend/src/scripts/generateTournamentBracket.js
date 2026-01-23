const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
require('dotenv').config();

// Función para generar bracket de eliminación simple completo
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

const generateBracket = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Obtener el torneo "Hiroko Gilbert"
    const tournament = await Tournament.findOne({ name: /Hiroko Gilbert/i });
    
    if (!tournament) {
      console.log('❌ Tournament not found');
      process.exit(1);
    }

    console.log(`Found tournament: ${tournament.name}`);
    console.log(`Participants: ${tournament.participants.length}`);

    const confirmedParticipants = tournament.participants.filter(
      p => p.status === 'confirmed'
    );

    if (confirmedParticipants.length < 2) {
      console.log('❌ Need at least 2 confirmed participants');
      process.exit(1);
    }

    console.log(`Confirmed participants: ${confirmedParticipants.length}`);

    // Generar bracket según modalidad
    let bracket;
    let matches = [];

    console.log(`Generating bracket for modality: ${tournament.modality}`);

    if (tournament.modality === 'single-elimination' || tournament.modality === 'standard' || tournament.modality === 'double-elimination') {
      const result = generateSingleEliminationBracket(confirmedParticipants);
      bracket = result.bracket;
      matches = result.matches;
      
      if (tournament.modality === 'double-elimination') {
        bracket.type = 'double-elimination';
        bracket.upperBracket = matches;
        bracket.lowerBracket = [];
      }
    } else if (tournament.modality === 'round-robin') {
      // Round robin
      bracket = {
        type: 'round-robin',
        participants: confirmedParticipants.map((p, index) => ({
          id: p._id,
          teamName: p.teamName,
          wins: 0,
          losses: 0,
          points: 0
        }))
      };

      let matchNumber = 1;
      for (let i = 0; i < confirmedParticipants.length; i++) {
        for (let j = i + 1; j < confirmedParticipants.length; j++) {
          matches.push({
            round: 'Fase de Grupos',
            matchNumber: matchNumber++,
            team1: {
              participantId: confirmedParticipants[i]._id,
              teamName: confirmedParticipants[i].teamName,
              score: []
            },
            team2: {
              participantId: confirmedParticipants[j]._id,
              teamName: confirmedParticipants[j].teamName,
              score: []
            },
            status: 'pending'
          });
        }
      }
    }

    tournament.bracket = bracket;
    tournament.matches = matches;
    tournament.status = 'in-progress';
    await tournament.save();

    console.log('\n✅ Bracket generated successfully!');
    console.log(`Total matches: ${matches.length}`);
    console.log('\nFirst 5 matches:');
    matches.slice(0, 5).forEach(match => {
      console.log(`${match.round} - Partido ${match.matchNumber}: ${match.team1.teamName} vs ${match.team2.teamName}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating bracket:', error);
    process.exit(1);
  }
};

generateBracket();
