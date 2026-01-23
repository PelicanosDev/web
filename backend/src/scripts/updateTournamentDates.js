const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
require('dotenv').config();

const updateTournamentDates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const tournaments = await Tournament.find({});
    console.log(`Found ${tournaments.length} tournaments to update`);

    const now = new Date();
    const updates = [];

    for (const tournament of tournaments) {
      // Establecer fechas futuras
      const registrationDeadline = new Date(now);
      registrationDeadline.setDate(registrationDeadline.getDate() + 30); // 30 días desde ahora

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + 35); // 35 días desde ahora

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2); // 2 días después del inicio

      tournament.dates.registrationDeadline = registrationDeadline;
      tournament.dates.start = startDate;
      tournament.dates.end = endDate;
      
      // Asegurar que el estado sea correcto
      if (tournament.status === 'upcoming' || tournament.status === 'registration') {
        tournament.status = 'registration';
      }

      await tournament.save();
      updates.push(tournament.name);
      
      console.log(`✅ Updated: ${tournament.name}`);
      console.log(`   Registration deadline: ${registrationDeadline.toLocaleDateString()}`);
      console.log(`   Start date: ${startDate.toLocaleDateString()}`);
      console.log(`   End date: ${endDate.toLocaleDateString()}`);
    }

    console.log(`\n✅ Successfully updated ${updates.length} tournaments`);
    console.log('Updated tournaments:', updates.join(', '));

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating tournaments:', error);
    process.exit(1);
  }
};

updateTournamentDates();
