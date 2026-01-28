require('dotenv').config();
const mongoose = require('mongoose');
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

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@pelicanos.co';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  Super Admin already exists with email:', email);
      console.log('Updating existing user...');
      
      existingUser.role = 'admin';
      existingUser.isActive = true;
      existingUser.profile.firstName = 'Super';
      existingUser.profile.lastName = 'Admin';
      await existingUser.save();
      
      console.log('✅ Super Admin updated successfully');
      console.log('Email:', email);
      console.log('Password: Use existing password or reset it manually');
    } else {
      console.log('👤 Creating Super Admin user...');
      const superAdmin = await User.create({
        email: email,
        password: 'SuperAdmin123!',
        role: 'admin',
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+573001234567'
        },
        isActive: true
      });
      
      console.log('✅ Super Admin created successfully!');
      console.log('Email:', superAdmin.email);
      console.log('Password: SuperAdmin123!');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
