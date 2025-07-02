/**
 * Create Test User Script
 * Creates a test admin user for testing purposes
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./src/models/user.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/default_db';

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      console.log('⚠️ Test user already exists');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      return;
    }

    // Create test admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const testUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      firstName: 'Test',
      lastName: 'Admin'
    });

    await testUser.save();
    console.log('✅ Test admin user created successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

createTestUser(); 