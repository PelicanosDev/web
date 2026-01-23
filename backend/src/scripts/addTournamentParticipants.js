const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
require('dotenv').config();

const addParticipants = async () => {
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
    console.log(`Current participants: ${tournament.participants.length}`);

    // Obtener usuarios existentes
    const users = await User.find({ role: 'member' }).limit(10);
    
    if (users.length === 0) {
      console.log('❌ No users found');
      process.exit(1);
    }

    // Equipos de ejemplo
    const teamNames = [
      'Los Pelícanos',
      'Águilas Doradas',
      'Tiburones FC',
      'Halcones Azules',
      'Leones del Mar',
      'Panteras Negras',
      'Tigres Blancos',
      'Dragones Rojos',
      'Lobos Grises',
      'Osos Pardos',
      'Cóndores Andinos',
      'Jaguares Salvajes',
      'Pumas Veloces',
      'Zorros Astutos',
      'Búhos Nocturnos',
      'Delfines Azules'
    ];

    const partnerNames = [
      { name: 'Juan Pérez', club: 'Club Deportivo', city: 'Manizales' },
      { name: 'María González', club: 'Vóley Club', city: 'Pereira' },
      { name: 'Carlos Rodríguez', club: 'Pelícanos', city: 'Manizales' },
      { name: 'Ana Martínez', club: 'Club Central', city: 'Armenia' },
      { name: 'Luis Fernández', club: 'Deportivo Sur', city: 'Cali' },
      { name: 'Laura Sánchez', club: 'Club Norte', city: 'Medellín' },
      { name: 'Diego Torres', club: 'Vóley Playa', city: 'Cartagena' },
      { name: 'Sofía López', club: 'Club Elite', city: 'Bogotá' },
      { name: 'Miguel Ángel', club: 'Deportivo', city: 'Manizales' },
      { name: 'Valentina Cruz', club: 'Club Playa', city: 'Santa Marta' },
      { name: 'Andrés Morales', club: 'Vóley Pro', city: 'Barranquilla' },
      { name: 'Camila Ruiz', club: 'Club Arena', city: 'Bucaramanga' },
      { name: 'Santiago Díaz', club: 'Deportivo Mar', city: 'Cartagena' },
      { name: 'Isabella Vargas', club: 'Club Sol', city: 'Cali' },
      { name: 'Mateo Herrera', club: 'Vóley Club', city: 'Pereira' },
      { name: 'Lucía Castro', club: 'Club Playa', city: 'Manizales' }
    ];

    // Limpiar participantes existentes excepto el primero (el usuario actual)
    const currentParticipants = tournament.participants.length;
    if (currentParticipants > 1) {
      tournament.participants = [tournament.participants[0]];
    }

    // Agregar participantes de prueba
    const numParticipants = Math.min(15, teamNames.length); // Agregar 15 equipos más
    
    for (let i = 0; i < numParticipants; i++) {
      const userIndex = i % users.length;
      const participant = {
        user: users[userIndex]._id,
        teamName: teamNames[i],
        partner: {
          name: partnerNames[i].name,
          email: `${partnerNames[i].name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: `+57 ${300 + i} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
          club: partnerNames[i].club,
          city: partnerNames[i].city,
          isMember: false
        },
        status: 'confirmed',
        registrationDate: new Date()
      };

      tournament.participants.push(participant);
    }

    await tournament.save();

    console.log(`✅ Successfully added ${numParticipants} participants`);
    console.log(`Total participants now: ${tournament.participants.length}`);
    console.log('\nParticipants:');
    tournament.participants.forEach((p, index) => {
      console.log(`${index + 1}. ${p.teamName}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding participants:', error);
    process.exit(1);
  }
};

addParticipants();
