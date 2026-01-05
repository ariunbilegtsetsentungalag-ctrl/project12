require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const dbURI = process.env.CONNECTION_STRING;

async function createBusinessOwner() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'App',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Get username from command line or use default
    const username = process.argv[2] || 'businessowner';

    // Check if user exists
    let user = await User.findOne({ username });

    if (user) {
      // Update existing user to business_owner role
      user.role = 'business_owner';
      await user.save();
      console.log(`✅ Updated existing user "${username}" to business_owner role`);
    } else {
      // Create new business owner account
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      user = new User({
        username: username,
        email: `${username}@business.com`,
        password: hashedPassword,
        role: 'business_owner'
      });

      await user.save();
      console.log(`✅ Created new business owner account:`);
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${username}@business.com`);
      console.log(`   Password: password123`);
      console.log(`   Role: business_owner`);
    }

    console.log('\n🎉 Business owner account is ready!');
    console.log(`\n📝 Login credentials:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Password: ${user ? 'password123' : 'Your existing password'}`);
    console.log(`\n🔗 Access the business portal at: http://localhost:9557/business-owner`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createBusinessOwner();
