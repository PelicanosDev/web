require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');

// Importar la lógica de generación de bracket directamente
const { generateSingleEliminationBracket } = require('../controllers/tournamentRegistrationController');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
};

// Replicar la lógica de advanceToEliminationBracket
function bracketSeed(sorted) {
  const n = sorted.length;
  function buildPositions(size) {
    if (size === 2) return [0, 1];
    const prev = buildPositions(size / 2);
    const result = [];
    for (const pos of prev) {
      result.push(pos);
      result.push(size - 1 - pos);
    }
    return result;
  }
  return buildPositions(n).map(i => sorted[i]);
}

const advance = async () => {
  try {
    await connectDB();

    const tournament = await Tournament.findById('69a914e19e8c79e76d3f5c38');
    if (!tournament) { console.error('❌ Tournament not found'); process.exit(1); }

    if (!tournament.groupPhaseComplete) {
      console.error('❌ groupPhaseComplete is false');
      process.exit(1);
    }

    const cfg = tournament.groupConfig;
    const method = cfg.classificationMethod || 'points';

    // Colectar clasificados por tier
    const allQualifiers = [];

    for (let tier = 1; tier <= cfg.teamsToAdvancePerGroup; tier++) {
      const tierQualifiers = [];
      for (const group of tournament.groups) {
        const p = group.participants.find(p => p.rank === tier);
        if (p) {
          tierQualifiers.push({
            ...p.toObject(),
            groupName: group.name,
            tierRank: tier
          });
        }
      }
      // Ordenar dentro del tier
      tierQualifiers.sort((a, b) => {
        const primaryA = method === 'points' ? a.points : a.coefficient;
        const primaryB = method === 'points' ? b.points : b.coefficient;
        if (primaryB !== primaryA) return primaryB - primaryA;
        const secA = method === 'points' ? a.coefficient : a.points;
        const secB = method === 'points' ? b.coefficient : b.points;
        return secB - secA;
      });
      allQualifiers.push(...tierQualifiers);
    }

    console.log(`\n📊 Clasificados directos: ${allQualifiers.length}`);
    allQualifiers.forEach((q, i) => {
      console.log(`  ${i+1}. ${q.teamName} (${q.groupName}, rank ${q.tierRank}) - ${q.points}pts, coef ${q.coefficient?.toFixed(2)}`);
    });

    // Calcular si se necesitan mejores terceros
    const numDirect = allQualifiers.length;
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(numDirect)));
    const extraNeeded = nextPow2 - numDirect;

    if (extraNeeded > 0) {
      console.log(`\n⚡ Necesitan ${extraNeeded} mejores terceros para completar ${nextPow2} equipos`);
      const thirds = [];
      for (const group of tournament.groups) {
        const p = group.participants.find(p => p.rank === cfg.teamsToAdvancePerGroup + 1);
        if (p) thirds.push({ ...p.toObject(), groupName: group.name, tierRank: cfg.teamsToAdvancePerGroup + 1 });
      }
      thirds.sort((a, b) => {
        const primaryA = method === 'points' ? a.points : a.coefficient;
        const primaryB = method === 'points' ? b.points : b.coefficient;
        if (primaryB !== primaryA) return primaryB - primaryA;
        const secA = method === 'points' ? a.coefficient : a.points;
        const secB = method === 'points' ? b.coefficient : b.points;
        return secB - secA;
      });
      const bestThirds = thirds.slice(0, extraNeeded);
      allQualifiers.push(...bestThirds);
      console.log(`  Mejores terceros añadidos:`);
      bestThirds.forEach(q => console.log(`    + ${q.teamName} (${q.groupName}) - ${q.points}pts`));
    }

    // Aplicar seeding
    const seeded = bracketSeed(allQualifiers);

    console.log(`\n🎯 Bracket con ${seeded.length} equipos:`);
    for (let i = 0; i < seeded.length; i += 2) {
      const lado = i < seeded.length / 2 ? 'A' : 'B';
      console.log(`  Lado ${lado}: ${seeded[i].teamName} vs ${seeded[i+1].teamName}`);
    }

    // Generar partidos de eliminación
    const matchOffset = tournament.matches.length;
    const participants = seeded.map(q => ({
      _id: q.participantId,
      teamName: q.teamName
    }));

    // Necesitamos llamar la función desde el controller
    // Como no podemos importarla fácilmente, la replicamos aquí
    const bracketMatches = generateElimBracket(participants, matchOffset);

    tournament.matches.push(...bracketMatches);
    tournament.bracket = { type: 'single-elimination', rounds: Math.log2(seeded.length) };
    tournament.markModified('matches');
    await tournament.save();

    console.log(`\n✅ ${bracketMatches.length} partidos de eliminación generados!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

function generateElimBracket(participants, matchNumberOffset = 0) {
  const n = participants.length;
  const matches = [];
  let matchNumber = matchNumberOffset + 1;

  // Ronda inicial con BYEs si n no es potencia de 2
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = nextPow2 - n;

  // Posiciones de los participantes
  const slots = [...participants];
  for (let i = 0; i < byes; i++) slots.push(null); // BYE

  // Generar partidos de la primera ronda
  const roundNames = ['Cuartos de Final', 'Semifinales', 'Final'];
  const totalRounds = Math.log2(nextPow2);

  let currentRound = [];

  // Primera ronda
  const roundName = totalRounds === 1 ? 'Final' : totalRounds === 2 ? 'Semifinales' : `Ronda de ${nextPow2}`;

  for (let i = 0; i < slots.length; i += 2) {
    const team1 = slots[i];
    const team2 = slots[i + 1];

    if (!team1 && !team2) continue;

    const match = {
      round: roundName,
      roundNumber: 1,
      matchNumber: matchNumber++,
      team1: team1 ? { participantId: team1._id, teamName: team1.teamName, score: [] } : { participantId: null, teamName: 'BYE', score: [] },
      team2: team2 ? { participantId: team2._id, teamName: team2.teamName, score: [] } : { participantId: null, teamName: 'BYE', score: [] },
      winner: null,
      status: 'pending',
      nextMatchNumber: null
    };

    // Si uno es BYE, el otro avanza automáticamente
    if (!team1 || !team2) {
      match.status = 'completed';
      match.winner = team1 ? team1._id : team2._id;
    }

    matches.push(match);
    currentRound.push(match);
  }

  // Rondas posteriores
  let roundNum = 2;
  while (currentRound.length > 1) {
    const nextRound = [];
    const nextRoundName = roundNum === totalRounds ? 'Final' : roundNum === totalRounds - 1 ? 'Semifinales' : `Cuartos de Final`;

    for (let i = 0; i < currentRound.length; i += 2) {
      const match = {
        round: nextRoundName,
        roundNumber: roundNum,
        matchNumber: matchNumber++,
        team1: { participantId: null, teamName: 'TBD', score: [] },
        team2: { participantId: null, teamName: 'TBD', score: [] },
        winner: null,
        status: 'pending',
        nextMatchNumber: null
      };

      // Vincular partidos anteriores al siguiente
      if (currentRound[i]) currentRound[i].nextMatchNumber = match.matchNumber;
      if (currentRound[i + 1]) currentRound[i + 1].nextMatchNumber = match.matchNumber;

      matches.push(match);
      nextRound.push(match);
    }

    currentRound = nextRound;
    roundNum++;
  }

  return matches;
}

advance();
