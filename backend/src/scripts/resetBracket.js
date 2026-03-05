require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
};

const reset = async () => {
  try {
    await connectDB();

    const tournament = await Tournament.findById('69a914e19e8c79e76d3f5c38');
    if (!tournament) { console.error('❌ Tournament not found'); process.exit(1); }

    // Conservar solo los partidos de grupo (los que tienen round = "Grupo X")
    const groupMatches = tournament.matches.filter(m => /^Grupo/.test(m.round));
    const elimMatches = tournament.matches.filter(m => !/^Grupo/.test(m.round));

    console.log(`📋 Partidos de grupo: ${groupMatches.length}`);
    console.log(`🗑️  Partidos de eliminación a eliminar: ${elimMatches.length}`);

    tournament.matches = groupMatches;
    tournament.bracket = null;
    tournament.groupPhaseComplete = true; // mantener como completa para poder avanzar

    tournament.markModified('matches');
    tournament.markModified('bracket');
    await tournament.save();

    console.log('✅ Bracket reseteado. Listo para generar nuevo bracket.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

reset();
