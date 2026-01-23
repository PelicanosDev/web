require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
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

const seedEvents = async () => {
  try {
    await connectDB();

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Run seedDatabase.js first.');
      process.exit(1);
    }

    console.log('🗑️  Cleaning existing events...');
    await Event.deleteMany({});

    console.log('📅 Creating sample events...');
    const events = await Event.insertMany([
      {
        title: 'Summer Beach Training Camp',
        description: 'Intensive 3-day training camp focused on advanced techniques and team building. All skill levels welcome!',
        type: 'training',
        date: new Date('2024-02-15T09:00:00'),
        endDate: new Date('2024-02-17T17:00:00'),
        location: 'Playa Grande, Cancia 1-4',
        isPublic: true,
        maxParticipants: 24,
        createdBy: adminUser._id,
      },
      {
        title: 'Copa Verano 2024 - Opening Ceremony',
        description: 'Join us for the official opening ceremony of our biggest tournament of the year!',
        type: 'tournament',
        date: new Date('2024-02-20T18:00:00'),
        location: 'Club Pelícanos Central',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'Weekly Team Practice',
        description: 'Regular team practice session. Focus on serves and blocking techniques.',
        type: 'training',
        date: new Date('2024-02-05T18:00:00'),
        endDate: new Date('2024-02-05T20:00:00'),
        location: 'Playa Grande',
        isPublic: false,
        maxParticipants: 16,
        createdBy: adminUser._id,
      },
      {
        title: 'Beach BBQ & Social Night',
        description: 'Relax and connect with fellow players! Food, drinks, and good vibes. Bring your family!',
        type: 'social',
        date: new Date('2024-02-10T19:00:00'),
        location: 'Playa Grande Social Area',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'Volleyball Fundamentals Workshop',
        description: 'Perfect for beginners! Learn the basics of beach volleyball from our experienced coaches.',
        type: 'workshop',
        date: new Date('2024-02-08T10:00:00'),
        endDate: new Date('2024-02-08T13:00:00'),
        location: 'Training Zone, Club Pelícanos',
        isPublic: true,
        maxParticipants: 12,
        createdBy: adminUser._id,
      },
      {
        title: 'Advanced Tactics Seminar',
        description: 'Deep dive into advanced game strategies, positioning, and team coordination.',
        type: 'workshop',
        date: new Date('2024-02-25T14:00:00'),
        endDate: new Date('2024-02-25T17:00:00'),
        location: 'Club Pelícanos Central',
        isPublic: true,
        maxParticipants: 20,
        createdBy: adminUser._id,
      },
      {
        title: 'Friendly Match vs Aguilas Club',
        description: 'Friendly competition against our neighbors. Come support the team!',
        type: 'tournament',
        date: new Date('2024-02-12T16:00:00'),
        location: 'Playa Grande',
        isPublic: true,
        createdBy: adminUser._id,
      },
      {
        title: 'Morning Conditioning Session',
        description: 'High-intensity conditioning and fitness training. Bring water and towel!',
        type: 'training',
        date: new Date('2024-02-07T06:30:00'),
        endDate: new Date('2024-02-07T08:00:00'),
        location: 'Training Zone',
        isPublic: false,
        maxParticipants: 15,
        createdBy: adminUser._id,
      },
    ]);

    console.log(`✅ Created ${events.length} sample events`);
    console.log('\n📋 Events Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Type: ${event.type} | Date: ${event.date.toLocaleDateString()}`);
      console.log(`   Location: ${event.location}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Events seeded successfully!');
    console.log('You can now view them in the Admin Events page.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
