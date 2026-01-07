const mongoose = require('mongoose');
require('dotenv').config();

async function updatePrices() {
  const dbURI = process.env.CONNECTION_STRING;
  await mongoose.connect(dbURI, { dbName: 'Ariuka' });
  const Product = require('../models/Product');
  
  const count = await Product.countDocuments();
  console.log('Found', count, 'products');
  
  // Update basePrice to 1000 MNT
  const result = await Product.updateMany({}, { $set: { basePrice: 1000 } });
  console.log('Updated products to 1000 MNT');
  
  // Verify
  const sample = await Product.findOne();
  console.log('Sample product basePrice:', sample?.basePrice);
  
  await mongoose.disconnect();
}

updatePrices();
