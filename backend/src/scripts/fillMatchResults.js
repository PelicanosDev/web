require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
};

// Genera un resultado realista de vóley (sets al mejor de 3)
function randomResult() {
  const r = Math.random();
  if (r < 0.4) {
    // Victoria 2-0
    return {
      team1Score: [randPts(true), randPts(true)],
      team2Score: [randPts(false), randPts(false)],
      team1Won: true
    };
  } else if (r < 0.6) {
    // Victoria 2-0 del equipo 2
    return {
      team1Score: [randPts(false), randPts(false)],
      team2Score: [randPts(true), randPts(true)],
      team1Won: false
    };
  } else if (r < 0.8) {
    // Victoria 2-1 del equipo 1
    return {
      team1Score: [randPts(true), randPts(false), randPts(true, true)],
      team2Score: [randPts(false), randPts(true), randPts(false, true)],
      team1Won: true
    };
  } else {
    // Victoria 2-1 del equipo 2
    return {
      team1Score: [randPts(false), randPts(true), randPts(false, true)],
      team2Score: [randPts(true), randPts(false), randPts(true, true)],
      team1Won: false
    };
  }
}

function randPts(winner, isTiebreak = false) {
  const max = isTiebreak ? 15 : 21;
  if (winner) return max;
  // Perdedor entre 10 y max-2
  return Math.floor(Math.random() * (max - 12)) + 10;
}

function rankGroupParticipants(participants, method, groupName, matches) {
  return [...participants].sort((a, b) => {
    const pA = method === 'points' ? a.points : a.coefficient;
    const pB = method === 'points' ? b.points : b.coefficient;
    if (pB !== pA) return pB - pA;
    const sA = method === 'points' ? a.coefficient : a.points;
    const sB = method === 'points' ? b.coefficient : b.points;
    if (sB !== sA) return sB - sA;
    const h2h = matches.find(m =>
      m.round === groupName && m.status === 'completed' &&
      ((m.team1.participantId?.toString() === a.participantId?.toString() &&
        m.team2.participantId?.toString() === b.participantId?.toString()) ||
       (m.team1.participantId?.toString() === b.participantId?.toString() &&
        m.team2.participantId?.toString() === a.participantId?.toString()))
    );
    if (h2h) return h2h.winner?.toString() === a.participantId?.toString() ? -1 : 1;
    return 0;
  });
}

const fill = async () => {
  try {
    await connectDB();

    const tournament = await Tournament.findById('69a914e19e8c79e76d3f5c38');
    if (!tournament) { console.error('❌ Tournament not found'); process.exit(1); }

    const cfg = tournament.groupConfig || {};
    const method = cfg.classificationMethod || 'points';
    const pointsCfg = cfg.pointsConfig || { win2_0: 3, win2_1: 2, lose2_1: 1, lose2_0: 0 };
    const coeffType = cfg.coefficientType || 'sets';

    // Tomar los primeros 20 partidos pendientes
    const pendingMatches = tournament.matches.filter(m => m.status === 'pending').slice(0, 20);
    console.log(`🎯 Llenando ${pendingMatches.length} de ${tournament.matches.length} partidos...\n`);

    for (const match of pendingMatches) {
      const { team1Score, team2Score, team1Won } = randomResult();

      match.team1.score = team1Score;
      match.team2.score = team2Score;
      match.winner = team1Won ? match.team1.participantId : match.team2.participantId;
      match.status = 'completed';

      // Actualizar standings del grupo
      const group = tournament.groups.find(g => g.name === match.round);
      if (group) {
        const p1 = group.participants.find(p => p.participantId?.toString() === match.team1.participantId?.toString());
        const p2 = group.participants.find(p => p.participantId?.toString() === match.team2.participantId?.toString());

        if (p1 && p2) {
          const t1Sets = team1Score.filter((s, i) => s > team2Score[i]).length;
          const t2Sets = team2Score.filter((s, i) => s > team1Score[i]).length;
          const t1Pts = team1Score.reduce((a, b) => a + b, 0);
          const t2Pts = team2Score.reduce((a, b) => a + b, 0);
          const isClean = team1Won ? t2Sets === 0 : t1Sets === 0;

          p1.played++; p1.setsFor += t1Sets; p1.setsAgainst += t2Sets;
          p1.pointsFor += t1Pts; p1.pointsAgainst += t2Pts;
          if (team1Won) { p1.wins++; p1.points += isClean ? (pointsCfg.win2_0 ?? 3) : (pointsCfg.win2_1 ?? 2); }
          else          { p1.losses++; p1.points += isClean ? (pointsCfg.lose2_0 ?? 0) : (pointsCfg.lose2_1 ?? 1); }
          p1.coefficient = coeffType === 'sets' ? p1.setsFor / Math.max(p1.setsAgainst, 1) : p1.pointsFor / Math.max(p1.pointsAgainst, 1);

          const isClean2 = team1Won ? t1Sets === 0 : t2Sets === 0; // para p2 ganador
          p2.played++; p2.setsFor += t2Sets; p2.setsAgainst += t1Sets;
          p2.pointsFor += t2Pts; p2.pointsAgainst += t1Pts;
          if (!team1Won) { p2.wins++; p2.points += isClean2 ? (pointsCfg.win2_0 ?? 3) : (pointsCfg.win2_1 ?? 2); }
          else           { p2.losses++; p2.points += isClean2 ? (pointsCfg.lose2_0 ?? 0) : (pointsCfg.lose2_1 ?? 1); }
          p2.coefficient = coeffType === 'sets' ? p2.setsFor / Math.max(p2.setsAgainst, 1) : p2.pointsFor / Math.max(p2.pointsAgainst, 1);

          const winner = team1Won ? match.team1.teamName : match.team2.teamName;
          const score = team1Score.map((s, i) => `${s}-${team2Score[i]}`).join(', ');
          console.log(`  [${match.round}] ${match.team1.teamName} vs ${match.team2.teamName} → ${score} (${winner})`);
        }
      }
    }

    // Verificar grupos completos y asignar ranks
    for (const group of tournament.groups) {
      const n = group.participants.length;
      const total = (n * (n - 1)) / 2;
      const completed = tournament.matches.filter(m => m.round === group.name && m.status === 'completed').length;
      if (completed >= total) {
        group.complete = true;
        const sorted = rankGroupParticipants(group.participants, method, group.name, tournament.matches);
        sorted.forEach((p, i) => { p.rank = i + 1; });
        console.log(`\n  ✅ ${group.name} COMPLETO`);
      }
    }

    if (tournament.groups.every(g => g.complete)) {
      tournament.groupPhaseComplete = true;
      console.log('\n🎉 ¡Fase de grupos COMPLETA!');
    }

    tournament.markModified('groups');
    tournament.markModified('matches');
    await tournament.save();

    console.log(`\n✅ ${pendingMatches.length} partidos completados.`);
    const remaining = tournament.matches.filter(m => m.status === 'pending').length;
    console.log(`📋 Quedan ${remaining} partidos pendientes.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

fill();
