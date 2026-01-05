require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const dbURI = process.env.CONNECTION_STRING;

const products = [
  // Clothing Category (5 products)
  {
    name: "Premium Cotton T-Shirt",
    description: "Ultra-soft 100% cotton t-shirt with modern fit. Perfect for casual wear, breathable fabric keeps you comfortable all day long.",
    basePrice: 24.99,
    category: "Clothing",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "S", price: 24.99 },
      { name: "M", price: 24.99 },
      { name: "L", price: 26.99 },
      { name: "XL", price: 28.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" }
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
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "28", price: 49.99 },
      { name: "30", price: 49.99 },
      { name: "32", price: 49.99 },
      { name: "34", price: 49.99 },
      { name: "36", price: 52.99 }
    ],
    colors: [
      { name: "Dark Blue", code: "#1E3A5F", image: "product1.svg" },
      { name: "Light Blue", code: "#87CEEB", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" }
    ],
    features: ["Stretch Denim", "5-Pocket Design", "Belt Loops", "Durable Stitching"],
    stockQuantity: 120,
    deliveryTime: 7
  },
  {
    name: "Luxury Wallet",
    description: "Handcrafted genuine leather wallet with RFID protection. Multiple card slots and bill compartment for organized storage.",
    basePrice: 79.99,
    category: "Clothing",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 79.99 }
    ],
    colors: [
      { name: "Brown", code: "#8B4513", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Tan", code: "#D2B48C", image: "product1.svg" }
    ],
    features: ["Genuine Leather", "RFID Protection", "8 Card Slots", "2 Bill Compartments"],
    stockQuantity: 80,
    deliveryTime: 3
  },
  {
    name: "Hooded Sweatshirt",
    description: "Cozy fleece-lined hoodie perfect for cool weather. Adjustable drawstring hood and kangaroo pocket for convenience.",
    basePrice: 39.99,
    category: "Clothing",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "S", price: 39.99 },
      { name: "M", price: 39.99 },
      { name: "L", price: 42.99 },
      { name: "XL", price: 44.99 },
      { name: "XXL", price: 46.99 }
    ],
    colors: [
      { name: "Gray", code: "#808080", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" },
      { name: "Burgundy", code: "#800020", image: "product1.svg" }
    ],
    features: ["Fleece Lined", "Adjustable Hood", "Kangaroo Pocket", "Ribbed Cuffs"],
    stockQuantity: 200,
    deliveryTime: 6
  },
  {
    name: "Business Blazer",
    description: "Professional tailored blazer with modern cut. Perfect for office wear or formal occasions. Wrinkle-resistant fabric.",
    basePrice: 129.99,
    category: "Clothing",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "36", price: 129.99 },
      { name: "38", price: 129.99 },
      { name: "40", price: 134.99 },
      { name: "42", price: 134.99 },
      { name: "44", price: 139.99 }
    ],
    colors: [
      { name: "Charcoal", code: "#36454F", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" }
    ],
    features: ["Wrinkle Resistant", "Modern Fit", "Two-Button Closure", "Interior Pockets"],
    stockQuantity: 60,
    deliveryTime: 10
  },

  // Shoes Category (5 products)
  {
    name: "Running Shoes Pro",
    description: "High-performance running shoes with advanced cushioning technology. Breathable mesh upper and responsive sole for maximum comfort.",
    basePrice: 89.99,
    category: "Shoes",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "7", price: 89.99 },
      { name: "8", price: 89.99 },
      { name: "9", price: 89.99 },
      { name: "10", price: 89.99 },
      { name: "11", price: 89.99 },
      { name: "12", price: 92.99 }
    ],
    colors: [
      { name: "Black/White", code: "#000000", image: "product1.svg" },
      { name: "Blue/Orange", code: "#0000FF", image: "product1.svg" },
      { name: "Gray/Red", code: "#808080", image: "product1.svg" }
    ],
    features: ["Advanced Cushioning", "Breathable Mesh", "Responsive Sole", "Lightweight Design"],
    stockQuantity: 100,
    deliveryTime: 5
  },
  {
    name: "Classic Leather Sneakers",
    description: "Versatile leather sneakers perfect for everyday wear. Timeless design with comfortable insole and durable rubber outsole.",
    basePrice: 69.99,
    category: "Shoes",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "7", price: 69.99 },
      { name: "8", price: 69.99 },
      { name: "9", price: 69.99 },
      { name: "10", price: 69.99 },
      { name: "11", price: 72.99 }
    ],
    colors: [
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Brown", code: "#8B4513", image: "product1.svg" }
    ],
    features: ["Genuine Leather", "Cushioned Insole", "Rubber Outsole", "Lace-Up Closure"],
    stockQuantity: 90,
    deliveryTime: 6
  },
  {
    name: "Hiking Boots",
    description: "Rugged hiking boots designed for outdoor adventures. Waterproof construction with excellent ankle support and traction.",
    basePrice: 119.99,
    category: "Shoes",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "7", price: 119.99 },
      { name: "8", price: 119.99 },
      { name: "9", price: 119.99 },
      { name: "10", price: 119.99 },
      { name: "11", price: 124.99 },
      { name: "12", price: 124.99 }
    ],
    colors: [
      { name: "Brown", code: "#8B4513", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" }
    ],
    features: ["Waterproof", "Ankle Support", "High Traction Sole", "Reinforced Toe"],
    stockQuantity: 70,
    deliveryTime: 8
  },
  {
    name: "Formal Dress Shoes",
    description: "Elegant leather dress shoes for formal occasions. Classic design with comfortable fit and premium craftsmanship.",
    basePrice: 99.99,
    category: "Shoes",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "7", price: 99.99 },
      { name: "8", price: 99.99 },
      { name: "9", price: 99.99 },
      { name: "10", price: 99.99 },
      { name: "11", price: 104.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Brown", code: "#8B4513", image: "product1.svg" }
    ],
    features: ["Genuine Leather", "Classic Design", "Cushioned Insole", "Non-Slip Sole"],
    stockQuantity: 55,
    deliveryTime: 7
  },
  {
    name: "Summer Sandals",
    description: "Comfortable and stylish sandals for warm weather. Adjustable straps and cushioned footbed for all-day comfort.",
    basePrice: 34.99,
    category: "Shoes",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "7", price: 34.99 },
      { name: "8", price: 34.99 },
      { name: "9", price: 34.99 },
      { name: "10", price: 34.99 },
      { name: "11", price: 36.99 }
    ],
    colors: [
      { name: "Brown", code: "#8B4513", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Tan", code: "#D2B48C", image: "product1.svg" }
    ],
    features: ["Adjustable Straps", "Cushioned Footbed", "Durable Sole", "Lightweight"],
    stockQuantity: 120,
    deliveryTime: 4
  },

  // Accessories Category (5 products)
  {
    name: "Smartwatch Fitness Tracker",
    description: "Advanced fitness tracking smartwatch with heart rate monitor, GPS, and waterproof design. Track your health goals in style.",
    basePrice: 199.99,
    category: "Accessories",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 199.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" },
      { name: "Rose Gold", code: "#B76E79", image: "product1.svg" }
    ],
    features: ["Heart Rate Monitor", "GPS Tracking", "Waterproof", "7-Day Battery"],
    stockQuantity: 85,
    deliveryTime: 5
  },
  {
    name: "Designer Sunglasses",
    description: "Premium polarized sunglasses with UV protection. Stylish frame design and comfortable fit for all-day wear.",
    basePrice: 149.99,
    category: "Accessories",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 149.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Tortoise", code: "#8B4513", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" }
    ],
    features: ["Polarized Lenses", "UV Protection", "Durable Frame", "Includes Case"],
    stockQuantity: 95,
    deliveryTime: 4
  },
  {
    name: "Leather Belt",
    description: "Classic leather belt with reversible design. Premium quality leather with durable buckle, perfect for any outfit.",
    basePrice: 39.99,
    category: "Accessories",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "32", price: 39.99 },
      { name: "34", price: 39.99 },
      { name: "36", price: 39.99 },
      { name: "38", price: 39.99 },
      { name: "40", price: 42.99 }
    ],
    colors: [
      { name: "Black/Brown", code: "#000000", image: "product1.svg" }
    ],
    features: ["Genuine Leather", "Reversible Design", "Adjustable", "Durable Buckle"],
    stockQuantity: 110,
    deliveryTime: 3
  },
  {
    name: "Backpack Travel Bag",
    description: "Spacious and durable backpack perfect for travel or daily use. Multiple compartments with padded laptop sleeve.",
    basePrice: 59.99,
    category: "Accessories",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 59.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Gray", code: "#808080", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" }
    ],
    features: ["Laptop Sleeve", "Water Resistant", "Multiple Compartments", "Padded Straps"],
    stockQuantity: 75,
    deliveryTime: 6
  },
  {
    name: "Wireless Headphones",
    description: "Premium noise-canceling wireless headphones with superior sound quality. Long battery life and comfortable ear cushions.",
    basePrice: 179.99,
    category: "Accessories",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 179.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" }
    ],
    features: ["Noise Canceling", "30-Hour Battery", "Bluetooth 5.0", "Foldable Design"],
    stockQuantity: 65,
    deliveryTime: 5
  },

  // Home & Living Category (5 products)
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 premium ceramic coffee mugs. Microwave and dishwasher safe with comfortable handle design.",
    basePrice: 29.99,
    category: "Home & Living",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "4-Pack", price: 29.99 }
    ],
    colors: [
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" },
      { name: "Gray", code: "#808080", image: "product1.svg" }
    ],
    features: ["Set of 4", "Microwave Safe", "Dishwasher Safe", "12 oz Capacity"],
    stockQuantity: 140,
    deliveryTime: 7
  },
  {
    name: "Luxury Bedding Set",
    description: "Premium quality bedding set with duvet cover and pillowcases. Soft, breathable fabric for ultimate comfort.",
    basePrice: 89.99,
    category: "Home & Living",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Queen", price: 89.99 },
      { name: "King", price: 109.99 }
    ],
    colors: [
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Gray", code: "#808080", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" },
      { name: "Beige", code: "#F5F5DC", image: "product1.svg" }
    ],
    features: ["Soft Fabric", "Breathable", "Machine Washable", "Includes Pillowcases"],
    stockQuantity: 50,
    deliveryTime: 10
  },
  {
    name: "Aromatherapy Diffuser",
    description: "Ultrasonic essential oil diffuser with LED lights. Creates relaxing atmosphere with your favorite scents.",
    basePrice: 44.99,
    category: "Home & Living",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 44.99 }
    ],
    colors: [
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Wood Grain", code: "#8B4513", image: "product1.svg" }
    ],
    features: ["LED Lights", "Auto Shut-Off", "Quiet Operation", "300ml Capacity"],
    stockQuantity: 100,
    deliveryTime: 5
  },
  {
    name: "Wall Clock Modern",
    description: "Stylish modern wall clock with silent movement. Perfect for living room, bedroom, or office decoration.",
    basePrice: 34.99,
    category: "Home & Living",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "12 inch", price: 34.99 },
      { name: "16 inch", price: 44.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Wood", code: "#8B4513", image: "product1.svg" }
    ],
    features: ["Silent Movement", "Easy to Read", "Battery Operated", "Modern Design"],
    stockQuantity: 80,
    deliveryTime: 6
  },
  {
    name: "Throw Pillow Covers",
    description: "Set of 2 decorative throw pillow covers. Soft fabric with hidden zipper, easy to clean and maintain.",
    basePrice: 24.99,
    category: "Home & Living",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "18x18 inch", price: 24.99 }
    ],
    colors: [
      { name: "Gray", code: "#808080", image: "product1.svg" },
      { name: "Navy", code: "#000080", image: "product1.svg" },
      { name: "Beige", code: "#F5F5DC", image: "product1.svg" },
      { name: "Burgundy", code: "#800020", image: "product1.svg" }
    ],
    features: ["Set of 2", "Hidden Zipper", "Machine Washable", "Soft Fabric"],
    stockQuantity: 130,
    deliveryTime: 5
  },

  // Electronics Category (5 products)
  {
    name: "Wireless Keyboard & Mouse",
    description: "Ergonomic wireless keyboard and mouse combo. Long battery life and reliable connection for productivity.",
    basePrice: 49.99,
    category: "Electronics",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 49.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" }
    ],
    features: ["Wireless Connection", "Ergonomic Design", "Long Battery Life", "Quiet Keys"],
    stockQuantity: 95,
    deliveryTime: 5
  },
  {
    name: "Portable Power Bank",
    description: "High-capacity 20000mAh power bank with fast charging. Charge multiple devices simultaneously on the go.",
    basePrice: 39.99,
    category: "Electronics",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "20000mAh", price: 39.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" },
      { name: "Red", code: "#FF0000", image: "product1.svg" }
    ],
    features: ["20000mAh Capacity", "Fast Charging", "2 USB Ports", "LED Indicator"],
    stockQuantity: 110,
    deliveryTime: 4
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof Bluetooth speaker with 360° sound. Perfect for outdoor activities and parties.",
    basePrice: 69.99,
    category: "Electronics",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 69.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" },
      { name: "Red", code: "#FF0000", image: "product1.svg" }
    ],
    features: ["Waterproof", "360° Sound", "12-Hour Battery", "Bluetooth 5.0"],
    stockQuantity: 85,
    deliveryTime: 5
  },
  {
    name: "USB-C Hub Multi-Port",
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader. Essential accessory for modern laptops.",
    basePrice: 54.99,
    category: "Electronics",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 54.99 }
    ],
    colors: [
      { name: "Gray", code: "#808080", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" }
    ],
    features: ["7-in-1 Ports", "4K HDMI Output", "USB 3.0", "SD Card Reader"],
    stockQuantity: 70,
    deliveryTime: 6
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch control and USB charging port. Perfect lighting for work or study.",
    basePrice: 44.99,
    category: "Electronics",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 44.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" }
    ],
    features: ["Touch Control", "USB Port", "Adjustable Arm", "5 Brightness Levels"],
    stockQuantity: 90,
    deliveryTime: 5
  },

  // Sports Category (5 products)
  {
    name: "Yoga Mat Premium",
    description: "Extra thick non-slip yoga mat with carrying strap. Eco-friendly material perfect for all types of workouts.",
    basePrice: 34.99,
    category: "Sports",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 34.99 }
    ],
    colors: [
      { name: "Purple", code: "#800080", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" },
      { name: "Pink", code: "#FFC0CB", image: "product1.svg" },
      { name: "Black", code: "#000000", image: "product1.svg" }
    ],
    features: ["Non-Slip", "Extra Thick", "Eco-Friendly", "Includes Strap"],
    stockQuantity: 120,
    deliveryTime: 5
  },
  {
    name: "Resistance Bands Set",
    description: "Set of 5 resistance bands with varying strength levels. Perfect for home workouts and physical therapy.",
    basePrice: 29.99,
    category: "Sports",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "5-Band Set", price: 29.99 }
    ],
    colors: [
      { name: "Multi-Color", code: "#FF0000", image: "product1.svg" }
    ],
    features: ["5 Resistance Levels", "Durable Latex", "Includes Bag", "Exercise Guide"],
    stockQuantity: 105,
    deliveryTime: 4
  },
  {
    name: "Adjustable Dumbbells",
    description: "Space-saving adjustable dumbbells from 5-52.5 lbs. Perfect for strength training at home.",
    basePrice: 299.99,
    category: "Sports",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "5-52.5 lbs", price: 299.99 }
    ],
    colors: [
      { name: "Black/Red", code: "#000000", image: "product1.svg" }
    ],
    features: ["Adjustable Weight", "Space Saving", "Quick Change", "Durable Construction"],
    stockQuantity: 40,
    deliveryTime: 10
  },
  {
    name: "Jump Rope Speed",
    description: "Professional speed jump rope with ball bearings. Adjustable length and comfortable foam handles.",
    basePrice: 19.99,
    category: "Sports",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 19.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Red", code: "#FF0000", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" }
    ],
    features: ["Ball Bearings", "Adjustable Length", "Foam Handles", "Lightweight"],
    stockQuantity: 150,
    deliveryTime: 3
  },
  {
    name: "Water Bottle Insulated",
    description: "Stainless steel insulated water bottle keeps drinks cold for 24 hours. Leak-proof lid and wide mouth opening.",
    basePrice: 24.99,
    category: "Sports",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "20 oz", price: 24.99 },
      { name: "32 oz", price: 29.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Blue", code: "#0000FF", image: "product1.svg" },
      { name: "Pink", code: "#FFC0CB", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" }
    ],
    features: ["Insulated", "Leak Proof", "BPA Free", "Wide Mouth"],
    stockQuantity: 180,
    deliveryTime: 4
  },

  // Other Category (5 products)
  {
    name: "Portable Phone Stand",
    description: "Adjustable phone stand for desk. Compatible with all smartphones and tablets, sturdy and stable design.",
    basePrice: 14.99,
    category: "Other",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 14.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" },
      { name: "White", code: "#FFFFFF", image: "product1.svg" }
    ],
    features: ["Adjustable Angle", "Anti-Slip", "Foldable", "Universal Fit"],
    stockQuantity: 200,
    deliveryTime: 3
  },
  {
    name: "Reusable Shopping Bags",
    description: "Set of 5 eco-friendly reusable shopping bags. Durable, washable, and folds compact for easy storage.",
    basePrice: 19.99,
    category: "Other",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "5-Pack", price: 19.99 }
    ],
    colors: [
      { name: "Multi-Color", code: "#FF0000", image: "product1.svg" }
    ],
    features: ["Set of 5", "Machine Washable", "Foldable", "Eco-Friendly"],
    stockQuantity: 160,
    deliveryTime: 4
  },
  {
    name: "Car Phone Mount",
    description: "Universal car phone mount with 360° rotation. Strong suction cup and adjustable holder for safe driving.",
    basePrice: 24.99,
    category: "Other",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 24.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" }
    ],
    features: ["360° Rotation", "Strong Suction", "Universal Fit", "Easy Installation"],
    stockQuantity: 130,
    deliveryTime: 5
  },
  {
    name: "Travel Luggage Tags",
    description: "Set of 4 durable luggage tags with privacy flap. Bright colors for easy identification of your bags.",
    basePrice: 12.99,
    category: "Other",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "4-Pack", price: 12.99 }
    ],
    colors: [
      { name: "Multi-Color", code: "#FF0000", image: "product1.svg" }
    ],
    features: ["Set of 4", "Privacy Flap", "Durable Material", "Bright Colors"],
    stockQuantity: 170,
    deliveryTime: 3
  },
  {
    name: "Digital Luggage Scale",
    description: "Portable digital luggage scale with LCD display. Accurately weighs up to 110 lbs, perfect for travel.",
    basePrice: 16.99,
    category: "Other",
    image: "product1.svg",
    images: ["product1.svg"],
    sizes: [
      { name: "Standard", price: 16.99 }
    ],
    colors: [
      { name: "Black", code: "#000000", image: "product1.svg" },
      { name: "Silver", code: "#C0C0C0", image: "product1.svg" }
    ],
    features: ["LCD Display", "110 lb Capacity", "Battery Operated", "Portable"],
    stockQuantity: 110,
    deliveryTime: 4
  }
];

async function seedProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbURI, {
      dbName: 'App',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Find the first admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});

    console.log('🌱 Seeding products...');
    const productsWithCreator = products.map(p => ({
      ...p,
      createdBy: adminUser._id
    }));

    await Product.insertMany(productsWithCreator);

    console.log(`✅ Successfully seeded ${products.length} products!`);
    console.log('\nProducts by category:');
    console.log('- Clothing: 5 products');
    console.log('- Shoes: 5 products');
    console.log('- Accessories: 5 products');
    console.log('- Home & Living: 5 products');
    console.log('- Electronics: 5 products');
    console.log('- Sports: 5 products');
    console.log('- Other: 5 products');
    console.log('\n🎉 Total: 35 products added to the database!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
