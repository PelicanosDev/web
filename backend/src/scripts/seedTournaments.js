require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedTournaments = async () => {
  try {
    await connectDB();

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Run seedDatabase.js first.');
      process.exit(1);
    }

    console.log('🗑️  Cleaning existing tournaments...');
    await Tournament.deleteMany({});

    console.log('🏆 Creating sample tournaments...');
    const tournaments = await Tournament.insertMany([
      {
        name: 'Copa Verano 2024 - Duplas Mixtas',
        description: 'El torneo más esperado del año. Duplas mixtas de todos los niveles compitiendo por el título de campeones del verano.',
        category: 'mixed',
        level: 'amateur',
        format: '2v2',
        modality: 'single-elimination',
        matchConfig: {
          totalSets: 3,
          setsToWin: 2,
          pointsPerSet: 21,
          finalSetPoints: 15,
          pointDifference: 2,
          hasTimeLimit: false,
          timeLimitMinutes: 0,
        },
        dates: {
          start: new Date('2024-03-15T09:00:00'),
          end: new Date('2024-03-17T18:00:00'),
          registrationDeadline: new Date('2024-03-10T23:59:59'),
        },
        location: {
          venue: 'Playa Grande',
          address: 'Cancia 1-4, Manizales, Caldas',
        },
        status: 'registration',
        maxTeams: 16,
        rules: 'Reglas oficiales FIVB. Cada equipo debe tener al menos un jugador de cada género en cancha.',
        organizer: adminUser._id,
      },
      {
        name: 'Torneo Rey de Cancha - Sábado',
        description: 'Formato dinámico donde el equipo ganador se queda en cancha. Perfecto para mejorar tu juego rápidamente.',
        category: 'mixed',
        level: 'recreational',
        format: '4v4',
        modality: 'king-of-court',
        matchConfig: {
          totalSets: 1,
          setsToWin: 1,
          pointsPerSet: 15,
          finalSetPoints: 15,
          pointDifference: 2,
          hasTimeLimit: true,
          timeLimitMinutes: 12,
        },
        dates: {
          start: new Date('2024-02-24T15:00:00'),
          end: new Date('2024-02-24T19:00:00'),
          registrationDeadline: new Date('2024-02-23T20:00:00'),
        },
        location: {
          venue: 'Club Pelícanos Central',
          address: 'Manizales, Caldas',
        },
        status: 'registration',
        maxTeams: 12,
        rules: 'El equipo ganador permanece en cancha. Partidos a 15 puntos o 12 minutos máximo.',
        organizer: adminUser._id,
      },
      {
        name: 'Liga Amateur - Temporada Primavera',
        description: 'Liga round-robin de 8 semanas. Todos los equipos juegan entre sí. Los mejores 4 avanzan a playoffs.',
        category: 'masculine',
        level: 'amateur',
        format: '4v4',
        modality: 'round-robin',
        matchConfig: {
          totalSets: 3,
          setsToWin: 2,
          pointsPerSet: 25,
          finalSetPoints: 15,
          pointDifference: 2,
          hasTimeLimit: false,
          timeLimitMinutes: 0,
        },
        dates: {
          start: new Date('2024-03-01T18:00:00'),
          end: new Date('2024-04-30T20:00:00'),
          registrationDeadline: new Date('2024-02-25T23:59:59'),
        },
        location: {
          venue: 'Playa Grande',
          address: 'Cancia 1-4, Manizales',
        },
        status: 'upcoming',
        maxTeams: 8,
        rules: 'Formato round-robin. Cada equipo juega contra todos los demás. Sistema de puntos: 3 pts por victoria, 0 por derrota.',
        organizer: adminUser._id,
      },
      {
        name: 'Torneo Femenino - Empoderamiento',
        description: 'Torneo exclusivo femenino con el objetivo de promover el vóley playa entre mujeres de todas las edades.',
        category: 'feminine',
        level: 'recreational',
        format: '2v2',
        modality: 'double-elimination',
        matchConfig: {
          totalSets: 2,
          setsToWin: 2,
          pointsPerSet: 21,
          finalSetPoints: 21,
          pointDifference: 2,
          hasTimeLimit: false,
          timeLimitMinutes: 0,
        },
        dates: {
          start: new Date('2024-03-08T10:00:00'),
          end: new Date('2024-03-08T17:00:00'),
          registrationDeadline: new Date('2024-03-05T23:59:59'),
        },
        location: {
          venue: 'Playa Norte',
          address: 'Manizales, Caldas',
        },
        status: 'registration',
        maxTeams: 12,
        rules: 'Doble eliminación: pierdes dos veces y quedas fuera. Premios para los 3 primeros lugares.',
        prizes: [
          { position: '1st', description: 'Trofeo + $500.000 COP', value: 500000 },
          { position: '2nd', description: 'Medallas + $300.000 COP', value: 300000 },
          { position: '3rd', description: 'Medallas + $150.000 COP', value: 150000 },
        ],
        organizer: adminUser._id,
      },
      {
        name: 'Open Profesional - Clasificatorio Nacional',
        description: 'Torneo profesional clasificatorio para el campeonato nacional. Nivel avanzado solamente.',
        category: 'mixed',
        level: 'professional',
        format: '2v2',
        modality: 'single-elimination',
        matchConfig: {
          totalSets: 3,
          setsToWin: 2,
          pointsPerSet: 21,
          finalSetPoints: 15,
          pointDifference: 2,
          hasTimeLimit: false,
          timeLimitMinutes: 0,
        },
        dates: {
          start: new Date('2024-04-20T08:00:00'),
          end: new Date('2024-04-21T18:00:00'),
          registrationDeadline: new Date('2024-04-15T23:59:59'),
        },
        location: {
          venue: 'Playa Grande',
          address: 'Cancia 1-4, Manizales',
        },
        status: 'upcoming',
        maxTeams: 32,
        rules: 'Reglas FIVB oficiales. Arbitraje profesional. Los ganadores clasifican al nacional.',
        prizes: [
          { position: '1st', description: 'Clasificación Nacional + $2.000.000 COP', value: 2000000 },
          { position: '2nd', description: 'Clasificación Nacional + $1.000.000 COP', value: 1000000 },
          { position: '3rd', description: '$500.000 COP', value: 500000 },
        ],
        organizer: adminUser._id,
      },
    ]);

    console.log(`✅ Created ${tournaments.length} sample tournaments`);
    console.log('\n📋 Tournaments Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    tournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.name}`);
      console.log(`   Format: ${tournament.format} | Modality: ${tournament.modality}`);
      console.log(`   Match Config: Best of ${tournament.matchConfig.totalSets} sets to ${tournament.matchConfig.pointsPerSet} pts`);
      console.log(`   Date: ${tournament.dates.start.toLocaleDateString()} | Teams: ${tournament.maxTeams}`);
      console.log(`   Status: ${tournament.status}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Tournaments seeded successfully!');
    console.log('You can now view them in the Admin Tournaments page.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tournaments:', error);
    process.exit(1);
  }
};

seedTournaments();
