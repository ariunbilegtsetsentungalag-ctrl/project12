require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

const dbURI = process.env.CONNECTION_STRING;

// Available images in the folder
const images = [
  "product1.svg",
  "product2.svg",
  "product3.svg",
  "product4.svg",
  "product-1758849718081-899053.jpg",
  "product-1758851305326-263402168.png",
  "product-1759230086618-779004635.jpg",
  "product-1761265524629-209183124.jpg",
  "product-1761265560797-669421295.jpg"
];

const products = [
  // Clothing Category
  {
    name: "Premium Cotton T-Shirt",
    description: "Ultra-soft 100% cotton t-shirt with modern fit. Perfect for casual wear, breathable fabric keeps you comfortable all day long.",
    basePrice: 24.99,
    category: "Clothing",
    image: images[0],
    images: [images[0], images[1]],
    sizes: [
      { name: "S", price: 24.99 },
      { name: "M", price: 24.99 },
      { name: "L", price: 26.99 },
      { name: "XL", price: 28.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[0] },
      { name: "White", code: "#FFFFFF", image: images[1] },
      { name: "Navy", code: "#000080", image: images[2] }
    ],
    features: ["100% Cotton", "Machine Washable", "Breathable Fabric", "Modern Fit"],
    stockQuantity: 150,
    deliveryTime: 5
  },
  {
    name: "Classic Denim Jeans",
    description: "Timeless denim jeans with comfortable stretch. Durable construction and classic five-pocket design for everyday style.",
    basePrice: 49.99,
    category: "Clothing",
    image: images[4],
    images: [images[4], images[5]],
    sizes: [
      { name: "28", price: 49.99 },
      { name: "30", price: 49.99 },
      { name: "32", price: 49.99 },
      { name: "34", price: 49.99 },
      { name: "36", price: 52.99 }
    ],
    colors: [
      { name: "Dark Blue", code: "#1E3A5F", image: images[4] },
      { name: "Light Blue", code: "#87CEEB", image: images[5] },
      { name: "Black", code: "#000000", image: images[6] }
    ],
    features: ["Stretch Denim", "5-Pocket Design", "Belt Loops", "Durable Stitching"],
    stockQuantity: 120,
    deliveryTime: 7
  },
  {
    name: "Hooded Sweatshirt",
    description: "Cozy fleece-lined hoodie perfect for cool weather. Adjustable drawstring hood and kangaroo pocket for convenience.",
    basePrice: 39.99,
    category: "Clothing",
    image: images[6],
    images: [images[6], images[7]],
    sizes: [
      { name: "S", price: 39.99 },
      { name: "M", price: 39.99 },
      { name: "L", price: 42.99 },
      { name: "XL", price: 44.99 },
      { name: "XXL", price: 46.99 }
    ],
    colors: [
      { name: "Gray", code: "#808080", image: images[6] },
      { name: "Black", code: "#000000", image: images[7] },
      { name: "Navy", code: "#000080", image: images[8] }
    ],
    features: ["Fleece Lined", "Adjustable Hood", "Kangaroo Pocket", "Ribbed Cuffs"],
    stockQuantity: 200,
    deliveryTime: 6
  },
  {
    name: "Business Blazer",
    description: "Professional tailored blazer with modern cut. Perfect for office wear or formal occasions. Wrinkle-resistant fabric.",
    basePrice: 89.99,
    category: "Clothing",
    image: images[8],
    images: [images[8], images[0]],
    sizes: [
      { name: "S", price: 89.99 },
      { name: "M", price: 89.99 },
      { name: "L", price: 94.99 },
      { name: "XL", price: 99.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[8] },
      { name: "Navy", code: "#000080", image: images[0] },
      { name: "Charcoal", code: "#36454F", image: images[1] }
    ],
    features: ["Wrinkle Resistant", "Two Button", "Notch Lapel", "Interior Pockets"],
    stockQuantity: 75,
    deliveryTime: 10
  },
  {
    name: "Summer Dress",
    description: "Elegant floral summer dress with flowing design. Lightweight fabric perfect for warm weather and special occasions.",
    basePrice: 59.99,
    category: "Clothing",
    image: images[1],
    images: [images[1], images[2]],
    sizes: [
      { name: "XS", price: 59.99 },
      { name: "S", price: 59.99 },
      { name: "M", price: 59.99 },
      { name: "L", price: 64.99 }
    ],
    colors: [
      { name: "Floral Blue", code: "#4169E1", image: images[1] },
      { name: "Floral Pink", code: "#FFB6C1", image: images[2] }
    ],
    features: ["Lightweight Fabric", "Floral Pattern", "Adjustable Straps", "Lined"],
    stockQuantity: 90,
    deliveryTime: 5
  },

  // Shoes Category
  {
    name: "Running Sneakers",
    description: "Professional running shoes with superior cushioning and support. Breathable mesh upper for maximum comfort during workouts.",
    basePrice: 79.99,
    category: "Shoes",
    image: images[2],
    images: [images[2], images[3]],
    sizes: [
      { name: "7", price: 79.99 },
      { name: "8", price: 79.99 },
      { name: "9", price: 79.99 },
      { name: "10", price: 79.99 },
      { name: "11", price: 79.99 }
    ],
    colors: [
      { name: "Black/White", code: "#000000", image: images[2] },
      { name: "Blue/Orange", code: "#0000FF", image: images[3] }
    ],
    features: ["Cushioned Sole", "Breathable Mesh", "Shock Absorption", "Non-Slip"],
    stockQuantity: 100,
    deliveryTime: 7
  },
  {
    name: "Leather Boots",
    description: "Stylish genuine leather boots with durable construction. Perfect for casual or semi-formal occasions.",
    basePrice: 129.99,
    category: "Shoes",
    image: images[3],
    images: [images[3], images[4]],
    sizes: [
      { name: "7", price: 129.99 },
      { name: "8", price: 129.99 },
      { name: "9", price: 129.99 },
      { name: "10", price: 129.99 },
      { name: "11", price: 134.99 }
    ],
    colors: [
      { name: "Brown", code: "#8B4513", image: images[3] },
      { name: "Black", code: "#000000", image: images[4] }
    ],
    features: ["Genuine Leather", "Cushioned Insole", "Rubber Sole", "Lace-Up"],
    stockQuantity: 60,
    deliveryTime: 10
  },
  {
    name: "Casual Slip-Ons",
    description: "Comfortable canvas slip-on shoes for everyday wear. Easy on and off with elastic goring and padded collar.",
    basePrice: 45.99,
    category: "Shoes",
    image: images[5],
    images: [images[5], images[6]],
    sizes: [
      { name: "7", price: 45.99 },
      { name: "8", price: 45.99 },
      { name: "9", price: 45.99 },
      { name: "10", price: 45.99 }
    ],
    colors: [
      { name: "Navy", code: "#000080", image: images[5] },
      { name: "Gray", code: "#808080", image: images[6] },
      { name: "Black", code: "#000000", image: images[7] }
    ],
    features: ["Canvas Upper", "Elastic Goring", "Padded Collar", "Flexible Sole"],
    stockQuantity: 140,
    deliveryTime: 5
  },
  {
    name: "Formal Dress Shoes",
    description: "Classic oxford dress shoes made from premium leather. Perfect for business meetings and formal events.",
    basePrice: 99.99,
    category: "Shoes",
    image: images[7],
    images: [images[7], images[8]],
    sizes: [
      { name: "7", price: 99.99 },
      { name: "8", price: 99.99 },
      { name: "9", price: 99.99 },
      { name: "10", price: 99.99 },
      { name: "11", price: 104.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[7] },
      { name: "Brown", code: "#8B4513", image: images[8] }
    ],
    features: ["Premium Leather", "Classic Oxford Style", "Leather Sole", "Lace-Up"],
    stockQuantity: 70,
    deliveryTime: 8
  },

  // Accessories Category
  {
    name: "Luxury Leather Wallet",
    description: "Handcrafted genuine leather wallet with RFID protection. Multiple card slots and bill compartment for organized storage.",
    basePrice: 79.99,
    category: "Accessories",
    image: images[4],
    images: [images[4]],
    sizes: [
      { name: "Standard", price: 79.99 }
    ],
    colors: [
      { name: "Brown", code: "#8B4513", image: images[4] },
      { name: "Black", code: "#000000", image: images[5] },
      { name: "Tan", code: "#D2B48C", image: images[6] }
    ],
    features: ["Genuine Leather", "RFID Protection", "8 Card Slots", "2 Bill Compartments"],
    stockQuantity: 80,
    deliveryTime: 3
  },
  {
    name: "Designer Sunglasses",
    description: "Stylish polarized sunglasses with UV400 protection. Lightweight frame and scratch-resistant lenses.",
    basePrice: 89.99,
    category: "Accessories",
    image: images[0],
    images: [images[0], images[1]],
    sizes: [
      { name: "Standard", price: 89.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[0] },
      { name: "Tortoise", code: "#8B4513", image: images[1] },
      { name: "Gold", code: "#FFD700", image: images[2] }
    ],
    features: ["UV400 Protection", "Polarized Lenses", "Scratch Resistant", "Lightweight"],
    stockQuantity: 95,
    deliveryTime: 5
  },
  {
    name: "Smart Watch",
    description: "Multi-functional smartwatch with fitness tracking, heart rate monitor, and notification alerts. Water-resistant design.",
    basePrice: 199.99,
    category: "Electronics",
    image: images[8],
    images: [images[8], images[0]],
    sizes: [
      { name: "Standard", price: 199.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[8] },
      { name: "Silver", code: "#C0C0C0", image: images[0] },
      { name: "Rose Gold", code: "#B76E79", image: images[1] }
    ],
    features: ["Heart Rate Monitor", "Step Counter", "Sleep Tracker", "Water Resistant"],
    stockQuantity: 50,
    deliveryTime: 7
  },

  // Electronics Category
  {
    name: "Wireless Earbuds",
    description: "Premium wireless earbuds with active noise cancellation. Long battery life and crystal-clear sound quality.",
    basePrice: 149.99,
    category: "Electronics",
    image: images[2],
    images: [images[2], images[3]],
    sizes: [
      { name: "Standard", price: 149.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[2] },
      { name: "White", code: "#FFFFFF", image: images[3] }
    ],
    features: ["Active Noise Cancellation", "30hr Battery Life", "Quick Charge", "IPX4 Water Resistant"],
    stockQuantity: 120,
    deliveryTime: 5
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Powerful portable speaker with 360-degree sound. Waterproof design perfect for outdoor adventures.",
    basePrice: 79.99,
    category: "Electronics",
    image: images[3],
    images: [images[3], images[4]],
    sizes: [
      { name: "Standard", price: 79.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: images[3] },
      { name: "Blue", code: "#0000FF", image: images[4] },
      { name: "Red", code: "#FF0000", image: images[5] }
    ],
    features: ["360° Sound", "Waterproof IPX7", "12hr Battery", "USB-C Charging"],
    stockQuantity: 85,
    deliveryTime: 6
  },

  // Sports Category
  {
    name: "Yoga Mat Premium",
    description: "Extra-thick yoga mat with superior cushioning and non-slip surface. Eco-friendly TPE material.",
    basePrice: 49.99,
    category: "Sports",
    image: images[5],
    images: [images[5], images[6]],
    sizes: [
      { name: "Standard (68x24 inch)", price: 49.99 }
    ],
    colors: [
      { name: "Purple", code: "#800080", image: images[5] },
      { name: "Blue", code: "#0000FF", image: images[6] },
      { name: "Pink", code: "#FFC0CB", image: images[7] }
    ],
    features: ["6mm Thickness", "Non-Slip Surface", "Eco-Friendly TPE", "Includes Strap"],
    stockQuantity: 100,
    deliveryTime: 4
  },
  {
    name: "Resistance Bands Set",
    description: "Complete set of 5 resistance bands with different resistance levels. Perfect for home workouts and travel.",
    basePrice: 29.99,
    category: "Sports",
    image: images[6],
    images: [images[6]],
    sizes: [
      { name: "Standard", price: 29.99 }
    ],
    colors: [
      { name: "Multi-Color", code: "#FF0000", image: images[6] }
    ],
    features: ["5 Resistance Levels", "Portable", "Includes Carry Bag", "Exercise Guide"],
    stockQuantity: 150,
    deliveryTime: 3
  },

  // Home & Living Category
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 elegant ceramic coffee mugs. Microwave and dishwasher safe. Perfect for daily use or gifting.",
    basePrice: 34.99,
    category: "Home & Living",
    image: images[7],
    images: [images[7], images[8]],
    sizes: [
      { name: "12 oz", price: 34.99 }
    ],
    colors: [
      { name: "White", code: "#FFFFFF", image: images[7] },
      { name: "Blue", code: "#0000FF", image: images[8] }
    ],
    features: ["Set of 4", "Microwave Safe", "Dishwasher Safe", "Lead-Free Ceramic"],
    stockQuantity: 120,
    deliveryTime: 5
  },
  {
    name: "Scented Candles Set",
    description: "Luxury scented candles made from natural soy wax. Set of 3 with relaxing fragrances for home aromatherapy.",
    basePrice: 39.99,
    category: "Home & Living",
    image: images[1],
    images: [images[1], images[2]],
    sizes: [
      { name: "Standard", price: 39.99 }
    ],
    colors: [
      { name: "Vanilla", code: "#F3E5AB", image: images[1] },
      { name: "Lavender", code: "#E6E6FA", image: images[2] }
    ],
    features: ["Natural Soy Wax", "40hr Burn Time", "Set of 3", "Reusable Containers"],
    stockQuantity: 90,
    deliveryTime: 4
  }
];

async function seedProductsWithImages() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'App',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@shop.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Admin user created (username: admin, password: admin123)');
    }

    // Seed categories first if they don't exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('🗂️  Seeding categories first...');
      const categories = [
        { name: 'Clothing', description: 'Apparel and fashion items' },
        { name: 'Shoes', description: 'Footwear for all occasions' },
        { name: 'Accessories', description: 'Fashion accessories' },
        { name: 'Home & Living', description: 'Home decoration and living essentials' },
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Sports', description: 'Sports equipment and fitness gear' },
        { name: 'Other', description: 'Miscellaneous items' }
      ];
      
      for (const cat of categories) {
        await Category.create({ ...cat, createdBy: adminUser._id });
      }
      console.log('✅ Categories seeded');
    }

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    console.log('🌱 Seeding products with real images...');
    const productsWithCreator = products.map(p => ({
      ...p,
      createdBy: adminUser._id
    }));

    await Product.insertMany(productsWithCreator);

    console.log(`✅ Successfully seeded ${products.length} products!`);
    console.log('\nProducts by category:');
    
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} products`);
    });
    
    console.log(`\n🎉 Total: ${products.length} products added with real images!`);
    console.log('\n📸 Images used:');
    images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProductsWithImages();
