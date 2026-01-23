require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const Badge = require('../models/Badge');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Cleaning existing data...');
    await User.deleteMany({});
    await Member.deleteMany({});
    await Badge.deleteMany({});

    console.log('👤 Creating Admin user...');
    const adminUser = await User.create({
      email: 'admin@pelicanos.co',
      password: 'Admin123!',
      role: 'admin',
      profile: {
        firstName: 'Daniel',
        lastName: 'Castaño',
        phone: '+573001234567'
      },
      isActive: true
    });
    console.log('✅ Admin created:', adminUser.email);

    console.log('👤 Creating Member user...');
    const memberUser = await User.create({
      email: 'member@pelicanos.co',
      password: 'Member123!',
      role: 'member',
      profile: {
        firstName: 'Sofia',
        lastName: 'Rodriguez',
        phone: '+573009876543'
      },
      isActive: true
    });
    console.log('✅ Member user created:', memberUser.email);

    console.log('🏐 Creating Member profile...');
    const memberCount = await Member.countDocuments();
    const member = await Member.create({
      userId: memberUser._id,
      memberNumber: `PEL${String(memberCount + 1).padStart(4, '0')}`,
      personalInfo: {
        birthDate: new Date('1998-05-15'),
        gender: 'F',
        address: 'Manizales, Caldas',
        emergencyContact: {
          name: 'Juan Rodriguez',
          phone: '+573001111111',
          relationship: 'Father'
        }
      },
      membership: {
        plan: 'basic',
        monthlyFee: 150000,
        startDate: new Date('2024-01-01'),
        status: 'active'
      },
      sportProfile: {
        position: 'hitter',
        dominantHand: 'right',
        experience: 'intermediate',
        schedule: ['Monday 6pm', 'Wednesday 6pm', 'Friday 6pm']
      },
      physicalRecords: [
        {
          date: new Date('2024-01-15'),
          height: 182,
          weight: 68,
          wingspan: 185,
          verticalJump: 45,
          serveSpeed: 60,
          spikeSpeed: 65,
          notes: 'Initial assessment',
          recordedBy: adminUser._id
        },
        {
          date: new Date('2024-06-15'),
          height: 182,
          weight: 67,
          wingspan: 185,
          verticalJump: 52,
          serveSpeed: 72,
          spikeSpeed: 78,
          notes: 'Mid-season progress - excellent improvement!',
          recordedBy: adminUser._id
        }
      ],
      gamification: {
        level: 5,
        xp: 3750,
        badges: [],
        achievements: [
          {
            type: 'first_win',
            title: 'First Victory',
            date: new Date('2024-02-10')
          },
          {
            type: 'attendance',
            title: '10 Sessions Streak',
            date: new Date('2024-03-15')
          }
        ]
      },
      attendance: [
        { date: new Date('2024-01-08'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-10'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-12'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-15'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-17'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-19'), present: false, sessionType: 'training' },
        { date: new Date('2024-01-22'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-24'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-26'), present: true, sessionType: 'training' },
        { date: new Date('2024-01-29'), present: true, sessionType: 'training' }
      ],
      matches: [
        {
          date: new Date('2024-10-24'),
          result: 'win',
          stats: {
            points: 12,
            aces: 3,
            blocks: 4,
            digs: 8
          }
        },
        {
          date: new Date('2024-10-18'),
          result: 'loss',
          stats: {
            points: 8,
            aces: 1,
            blocks: 2,
            digs: 6
          }
        },
        {
          date: new Date('2024-10-12'),
          result: 'win',
          stats: {
            points: 15,
            aces: 5,
            blocks: 3,
            digs: 10
          }
        }
      ]
    });
    console.log('✅ Member profile created:', member.memberNumber);

    console.log('🏆 Creating sample badges...');
    const badges = await Badge.insertMany([
      {
        name: 'Dedicated',
        description: 'Attend 10 consecutive training sessions',
        icon: '🎯',
        category: 'attendance',
        criteria: {
          type: 'attendance_count',
          value: 10,
          description: 'Attend 10 training sessions'
        },
        rarity: 'common',
        xpReward: 100,
        isActive: true
      },
      {
        name: 'Ace Master',
        description: 'Score 5 aces in a single match',
        icon: '⚡',
        category: 'performance',
        criteria: {
          type: 'special',
          value: 5,
          description: '5 aces in one match'
        },
        rarity: 'rare',
        xpReward: 200,
        isActive: true
      },
      {
        name: 'Champion',
        description: 'Win a tournament',
        icon: '🏆',
        category: 'achievement',
        criteria: {
          type: 'tournament_wins',
          value: 1,
          description: 'Win your first tournament'
        },
        rarity: 'epic',
        xpReward: 500,
        isActive: true
      },
      {
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: '⭐',
        category: 'achievement',
        criteria: {
          type: 'level_reached',
          value: 5,
          description: 'Reach Level 5'
        },
        rarity: 'rare',
        xpReward: 250,
        isActive: true
      },
      {
        name: 'Team Player',
        description: 'Participate in 5 team events',
        icon: '🤝',
        category: 'special',
        criteria: {
          type: 'special',
          value: 5,
          description: 'Join 5 team events'
        },
        rarity: 'common',
        xpReward: 150,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${badges.length} badges`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 ADMIN:');
    console.log('   Email: admin@pelicanos.co');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('👤 MEMBER:');
    console.log('   Email: member@pelicanos.co');
    console.log('   Password: Member123!');
    console.log('   Member #:', member.memberNumber);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
