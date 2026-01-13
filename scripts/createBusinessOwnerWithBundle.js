require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const dbURI = process.env.CONNECTION_STRING;

async function createBusinessOwnerWithBundle() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'Ariuka',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Username from command line or default
    const username = process.argv[2] || 'seller1';

    // Check if user exists
    let user = await User.findOne({ username });

    if (user) {
      // Update existing user to business_owner with 10 product limit
      user.role = 'business_owner';
      user.businessBundle = {
        tier: 'basic',
        productsAllowed: 10,
        productsUsed: 0,
        purchaseDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      };
      await user.save();
      console.log(`✅ Updated "${username}" to business owner with 10 product bundle`);
    } else {
      // Create new business owner account with bundle
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      user = new User({
        username: username,
        email: `${username}@shop.com`,
        password: hashedPassword,
        role: 'business_owner',
        businessBundle: {
          tier: 'basic',
          productsAllowed: 10,
          productsUsed: 0,
          purchaseDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      });

      await user.save();
      console.log('✅ Created new business owner account with 10 product bundle');
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 BUSINESS OWNER ACCOUNT READY');
    console.log('═══════════════════════════════════════════');
    console.log(`👤 Username: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: password123`);
    console.log(`📦 Products Allowed: 10`);
    console.log(`📦 Products Used: 0`);
    console.log('═══════════════════════════════════════════');
    console.log(`\n🌐 Login at: http://localhost:9556/login`);
    console.log(`📊 Dashboard: http://localhost:9556/business-owner/dashboard`);
    console.log(`➕ Add Products: http://localhost:9556/business-owner/add-product`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createBusinessOwnerWithBundle();
