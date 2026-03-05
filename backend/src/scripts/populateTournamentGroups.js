require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected');
};

const teamNames = [
  'Los Pelícanos', 'Marea Alta', 'Arena y Sol', 'Viento y Olas',
  'Los Tiburones', 'Ola Brava', 'Los Delfines', 'Tormenta Azul',
  'Los Gaviotines', 'Brisa Marina', 'Los Cormoranes', 'Surf Team',
];

const populate = async () => {
  try {
    await connectDB();

    const tournamentId = '69a914e19e8c79e76d3f5c38';
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      console.error('❌ Tournament not found');
      process.exit(1);
    }
    console.log(`🏆 Tournament: ${tournament.name}`);

    // Obtener usuarios miembro
    const members = await User.find({ role: 'member' }).limit(24);
    console.log(`👤 Found ${members.length} member users`);

    // Limpiar participantes existentes
    tournament.participants = [];

    // Agrupar miembros en duplas (format es 2v2)
    const pairs = [];
    for (let i = 0; i < members.length - 1; i += 2) {
      pairs.push([members[i], members[i + 1]]);
      if (pairs.length >= 12) break; // máximo 12 equipos para 3 grupos de 4
    }

    console.log(`👫 Creating ${pairs.length} teams (pairs)...`);

    pairs.forEach(([player1, player2], idx) => {
      const teamName = teamNames[idx] || `Equipo ${idx + 1}`;
      tournament.participants.push({
        user: player1._id,
        teamName,
        partner: {
          name: `${player2.profile?.firstName || 'Jugador'} ${player2.profile?.lastName || (idx + 2)}`,
          email: player2.email,
          isMember: true,
          userId: player2._id,
        },
        status: 'confirmed',
        registrationDate: new Date(),
      });
      console.log(`  ✓ ${teamName}: ${player1.profile?.firstName} & ${player2.profile?.firstName}`);
    });

    await tournament.save();
    console.log(`\n✅ Tournament populated with ${tournament.participants.length} teams!`);
    console.log(`   Tournament is ready to generate groups.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

populate();
