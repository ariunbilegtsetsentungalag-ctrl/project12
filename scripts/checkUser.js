require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const dbURI = process.env.CONNECTION_STRING;

async function checkUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'Ariuka',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB\n');

    // Get username from command line
    const username = process.argv[2];
    
    if (!username) {
      console.log('❌ Please provide username: node scripts/checkUser.js <username>');
      process.exit(1);
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User "${username}" not found in database`);
      process.exit(0);
    }

    console.log('═══════════════════════════════════════════');
    console.log('👤 USER INFORMATION');
    console.log('═══════════════════════════════════════════');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive ? 'Yes' : 'No'}`);
    console.log(`Verified: ${user.isVerified ? 'Yes' : 'No'}`);
    
    if (user.permissions && user.permissions.length > 0) {
      console.log(`Permissions: ${user.permissions.join(', ')}`);
    }
    
    console.log('\n📦 BUNDLE INFORMATION');
    console.log('═══════════════════════════════════════════');
    
    if (user.businessBundle) {
      console.log(`Tier: ${user.businessBundle.tier || 'none'}`);
      console.log(`Products Allowed: ${user.businessBundle.productsAllowed || 0}`);
      console.log(`Products Used: ${user.businessBundle.productsUsed || 0}`);
      console.log(`Products Remaining: ${(user.businessBundle.productsAllowed || 0) - (user.businessBundle.productsUsed || 0)}`);
      
      if (user.businessBundle.purchaseDate) {
        console.log(`Purchase Date: ${new Date(user.businessBundle.purchaseDate).toLocaleDateString()}`);
      }
      if (user.businessBundle.expiryDate) {
        console.log(`Expiry Date: ${new Date(user.businessBundle.expiryDate).toLocaleDateString()}`);
      }
      
      // Check if bundle is valid
      const hasBundle = user.businessBundle.tier !== 'none' && user.businessBundle.productsAllowed > 0;
      const canAddProduct = hasBundle && (user.businessBundle.productsUsed < user.businessBundle.productsAllowed);
      
      console.log('\n✅ STATUS:');
      console.log(`Has Active Bundle: ${hasBundle ? 'YES ✓' : 'NO ✗'}`);
      console.log(`Can Add Products: ${canAddProduct ? 'YES ✓' : 'NO ✗'}`);
      
      if (!hasBundle) {
        console.log('\n⚠️  User needs to purchase a bundle to add products');
      } else if (!canAddProduct) {
        console.log('\n⚠️  User has reached product limit');
      }
    } else {
      console.log('No bundle information (not a business owner)');
    }
    
    console.log('═══════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
