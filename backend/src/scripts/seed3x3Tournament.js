require('dotenv').config();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

const TEAMS = [
  { teamName: 'Los Pelícanos',     partner: { name: 'Daniel Castaño',    city: 'Manizales',   club: 'Pelícanos' } },
  { teamName: 'Águilas Doradas',   partner: { name: 'Juan Pérez',         city: 'Pereira',     club: 'Club Eje' } },
  { teamName: 'Tiburones FC',      partner: { name: 'Carlos Rodríguez',   city: 'Manizales',   club: 'Pelícanos' } },
  { teamName: 'Halcones Azules',   partner: { name: 'Ana Martínez',       city: 'Armenia',     club: 'Club Central' } },
  { teamName: 'Leones del Mar',    partner: { name: 'Luis Fernández',     city: 'Cali',        club: 'Deportivo Sur' } },
  { teamName: 'Panteras Negras',   partner: { name: 'Laura Sánchez',      city: 'Medellín',    club: 'Club Norte' } },
  { teamName: 'Dragones Rojos',    partner: { name: 'Diego Torres',       city: 'Cartagena',   club: 'Vóley Playa' } },
  { teamName: 'Cóndores Andinos',  partner: { name: 'Valentina Cruz',     city: 'Santa Marta', club: 'Club Playa' } },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No hay usuario admin. Ejecuta seedDatabase.js primero.');
      process.exit(1);
    }

    // Eliminar versión anterior del torneo 3 X 3 si existe
    const existing = await Tournament.findOne({ name: '3 X 3' });
    if (existing) {
      await Tournament.deleteOne({ _id: existing._id });
      console.log('🗑️  Torneo "3 X 3" anterior eliminado');
    }

    // Obtener un usuario miembro para asociar a los equipos (puede ser null)
    const memberUsers = await User.find({ role: 'member' }).limit(8);

    // Construir participantes
    const participants = TEAMS.map((t, i) => ({
      user: memberUsers[i]?._id || null,
      teamName: t.teamName,
      partner: {
        name: t.partner.name,
        email: `${t.partner.name.toLowerCase().replace(/\s+/g, '.')}@test.com`,
        phone: `+57 300 ${String(i + 1).padStart(3, '0')} 0000`,
        club: t.partner.club,
        city: t.partner.city,
        isMember: false,
      },
      status: 'confirmed',
      registrationDate: new Date(),
    }));

    const tournament = await Tournament.create({
      name: '3 X 3',
      description: 'Torneo de prueba 3 contra 3 para testeo de generación de llaves.',
      category: 'mixed',
      level: 'amateur',
      format: '4v4',
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
        start: new Date('2026-04-01T09:00:00'),
        end: new Date('2026-04-01T18:00:00'),
        registrationDeadline: new Date('2026-03-28T23:59:59'),
      },
      location: {
        venue: 'Playa Grande',
        address: 'Cancia 1-4, Manizales, Caldas',
      },
      status: 'registration',
      maxTeams: 16,
      rules: 'Reglas estándar de vóley playa. Formato 3 vs 3.',
      prizes: [
        { position: '1st', description: 'Trofeo + $500.000 COP', value: 500000 },
        { position: '2nd', description: 'Medallas + $300.000 COP', value: 300000 },
        { position: '3rd', description: 'Medallas + $150.000 COP', value: 150000 },
      ],
      organizer: admin._id,
      participants,
    });

    console.log(`\n✅ Torneo "${tournament.name}" creado con ${tournament.participants.length} equipos confirmados`);
    console.log(`   ID: ${tournament._id}`);
    console.log('\n📋 Equipos:');
    tournament.participants.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.teamName.padEnd(20)} — compañero: ${p.partner.name} (${p.partner.city})`);
    });
    console.log('\n🎯 Listo para generar llaves desde el panel admin.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
