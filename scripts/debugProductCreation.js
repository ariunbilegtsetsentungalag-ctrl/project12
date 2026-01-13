require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const dbURI = process.env.CONNECTION_STRING;

async function debugProductCreation() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'Ariuka',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB\n');

    const username = process.argv[2] || 'Ariunbileg';
    
    console.log(`🔍 Checking user: ${username}\n`);
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User "${username}" not found`);
      process.exit(0);
    }

    console.log('═══════════════════════════════════════════');
    console.log('👤 USER DETAILS');
    console.log('═══════════════════════════════════════════');
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    
    console.log('\n📦 BUNDLE CHECK');
    console.log('═══════════════════════════════════════════');
    
    if (!user.businessBundle) {
      console.log('❌ No businessBundle field found!');
      console.log('   This user needs a bundle to add products.');
      process.exit(0);
    }

    console.log(`Tier: ${user.businessBundle.tier}`);
    console.log(`Products Allowed: ${user.businessBundle.productsAllowed}`);
    console.log(`Products Used: ${user.businessBundle.productsUsed || 0}`);
    
    // Check conditions
    const hasBundle = user.businessBundle && 
                      user.businessBundle.tier !== 'none' && 
                      user.businessBundle.productsAllowed > 0;
    
    const canAddProduct = hasBundle && 
                         (user.businessBundle.productsUsed < user.businessBundle.productsAllowed);

    console.log('\n✅ VALIDATION CHECKS');
    console.log('═══════════════════════════════════════════');
    console.log(`Has Valid Bundle: ${hasBundle ? '✓ YES' : '✗ NO'}`);
    console.log(`Can Add Product: ${canAddProduct ? '✓ YES' : '✗ NO'}`);
    
    if (!hasBundle) {
      console.log('\n⚠️  PROBLEM: User has no valid bundle');
      console.log('   - Tier must not be "none"');
      console.log('   - Products allowed must be > 0');
    } else if (!canAddProduct) {
      console.log('\n⚠️  PROBLEM: Product limit reached');
      console.log(`   - Used: ${user.businessBundle.productsUsed}`);
      console.log(`   - Allowed: ${user.businessBundle.productsAllowed}`);
    } else {
      console.log('\n✅ USER CAN ADD PRODUCTS!');
    }
    
    // Check existing products
    const userProducts = await Product.find({ createdBy: user._id });
    console.log('\n📦 EXISTING PRODUCTS');
    console.log('═══════════════════════════════════════════');
    console.log(`Total products in DB: ${userProducts.length}`);
    
    if (userProducts.length > 0) {
      userProducts.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (Category: ${p.category})`);
      });
    }
    
    // Check discrepancy
    if (userProducts.length !== (user.businessBundle.productsUsed || 0)) {
      console.log('\n⚠️  DISCREPANCY DETECTED!');
      console.log(`   Products in DB: ${userProducts.length}`);
      console.log(`   Products Used count: ${user.businessBundle.productsUsed || 0}`);
      console.log('\n   Fixing count...');
      
      user.businessBundle.productsUsed = userProducts.length;
      await user.save();
      console.log(`   ✓ Updated productsUsed to ${userProducts.length}`);
    }

    console.log('\n═══════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugProductCreation();
