const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const User = require('../models/User');
const Bundle = require('../models/Bundle');
const { BUNDLE_TIERS } = require('../models/Bundle');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

exports.uploadProductImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

// Get Bundle Purchase Page
exports.getBuyBundle = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    
    // Get current bundle info
    let currentBundle = null;
    if (user.businessBundle && user.businessBundle.tier !== 'none') {
      const tierInfo = BUNDLE_TIERS[user.businessBundle.tier];
      currentBundle = {
        tier: user.businessBundle.tier,
        tierName: tierInfo ? tierInfo.name : user.businessBundle.tier,
        productsAllowed: user.businessBundle.productsAllowed,
        productsUsed: user.businessBundle.productsUsed,
        expiryDate: user.businessBundle.expiryDate
      };
    }
    
    res.render('business-owner/buy-bundle', {
      title: 'Buy Product Bundle',
      bundles: BUNDLE_TIERS,
      currentBundle
    });
  } catch (error) {
    console.error('Get bundle page error:', error);
    req.flash('error', 'Failed to load bundle page');
    res.redirect('/business-owner');
  }
};

// Purchase Bundle
exports.purchaseBundle = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { tier } = req.body;
    
    // Validate tier
    if (!BUNDLE_TIERS[tier]) {
      req.flash('error', 'Invalid bundle tier selected');
      return res.redirect('/business-owner/buy-bundle');
    }
    
    const bundleInfo = BUNDLE_TIERS[tier];
    const user = await User.findById(userId);
    
    // TODO: Integrate actual payment processing here
    // For now, we'll simulate a successful purchase
    
    // Create bundle purchase record
    const bundlePurchase = new Bundle({
      userId: userId,
      tier: tier,
      productsAllowed: bundleInfo.products,
      price: bundleInfo.price,
      paymentStatus: 'completed',
      transactionId: 'TXN-' + Date.now(),
      purchaseDate: new Date()
    });
    await bundlePurchase.save();
    
    // Update user's bundle
    const previousAllowed = user.businessBundle?.productsAllowed || 0;
    user.businessBundle = {
      tier: tier,
      productsAllowed: previousAllowed + bundleInfo.products,
      productsUsed: user.businessBundle?.productsUsed || 0,
      purchaseDate: new Date(),
      purchaseHistory: [
        ...(user.businessBundle?.purchaseHistory || []),
        {
          tier: tier,
          productsAllowed: bundleInfo.products,
          price: bundleInfo.price,
          purchaseDate: new Date()
        }
      ]
    };
    
    await user.save();
    
    req.flash('success', `Successfully purchased ${bundleInfo.name} bundle! You can now add up to ${bundleInfo.products} products.`);
    res.redirect('/business-owner');
  } catch (error) {
    console.error('Purchase bundle error:', error);
    req.flash('error', 'Failed to process bundle purchase');
    res.redirect('/business-owner/buy-bundle');
  }
};

// Dashboard - Show business owner's stats
exports.dashboard = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    
    // Check if user has a bundle
    const hasBundle = user.businessBundle && user.businessBundle.tier !== 'none' && user.businessBundle.productsAllowed > 0;
    
    // Get current bundle info
    let bundleInfo = null;
    if (hasBundle) {
      const tierInfo = BUNDLE_TIERS[user.businessBundle.tier];
      bundleInfo = {
        tier: user.businessBundle.tier,
        tierName: tierInfo ? tierInfo.name : user.businessBundle.tier,
        productsAllowed: user.businessBundle.productsAllowed,
        productsUsed: user.businessBundle.productsUsed,
        remaining: user.businessBundle.productsAllowed - user.businessBundle.productsUsed,
        color: tierInfo ? tierInfo.color : '#6366f1'
      };
    }
    
    // Get business owner's products
    const products = await Product.find({ createdBy: userId }).lean();
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.stockQuantity > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;

    // Get orders containing business owner's products
    const productIds = products.map(p => p._id);
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).lean();

    // Calculate revenue from business owner's products only
    let totalRevenue = 0;
    let totalOrders = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.productId))) {
          totalRevenue += item.price * item.quantity;
          totalOrders++;
        }
      });
    });

    res.render('business-owner/dashboard', {
      title: 'Business Dashboard',
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      recentProducts: products.slice(0, 5),
      hasBundle,
      bundleInfo
    });
  } catch (error) {
    console.error('Business dashboard error:', error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/shop');
  }
};

// Get all products for business owner
exports.getProducts = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    const hasBundle = user.businessBundle && user.businessBundle.tier !== 'none' && user.businessBundle.productsAllowed > 0;
    
    const products = await Product.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.render('business-owner/products', {
      title: 'My Products',
      products,
      hasBundle,
      bundleInfo: hasBundle ? user.businessBundle : null
    });
  } catch (error) {
    console.error('Get products error:', error);
    req.flash('error', 'Failed to load products');
    res.redirect('/business-owner');
  }
};

// Show add product form
exports.getAddProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    
    // Check if user has a valid bundle
    const hasBundle = user.businessBundle && user.businessBundle.tier !== 'none' && user.businessBundle.productsAllowed > 0;
    const canAddProduct = hasBundle && (user.businessBundle.productsUsed < user.businessBundle.productsAllowed);
    
    if (!hasBundle) {
      req.flash('error', 'You need to purchase a product bundle before adding products.');
      return res.redirect('/business-owner/buy-bundle');
    }
    
    if (!canAddProduct) {
      req.flash('error', 'You have reached your product limit. Please upgrade your bundle to add more products.');
      return res.redirect('/business-owner/buy-bundle');
    }
    
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.render('business-owner/add-product', {
      title: 'Add New Product',
      categories: categories.map(c => c.name),
      bundleInfo: user.businessBundle
    });
  } catch (error) {
    console.error('Get add product error:', error);
    res.render('business-owner/add-product', {
      title: 'Add New Product',
      categories: ['Clothing', 'Shoes', 'Accessories', 'Home & Living', 'Electronics', 'Sports', 'Other']
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    
    // Check bundle limits before creating product
    const hasBundle = user.businessBundle && user.businessBundle.tier !== 'none' && user.businessBundle.productsAllowed > 0;
    const canAddProduct = hasBundle && (user.businessBundle.productsUsed < user.businessBundle.productsAllowed);
    
    if (!canAddProduct) {
      req.flash('error', 'You have reached your product limit. Please upgrade your bundle.');
      return res.redirect('/business-owner/buy-bundle');
    }
    
    const {
      name,
      description,
      basePrice,
      category,
      stockQuantity,
      deliveryTime,
      sizes,
      colors,
      features
    } = req.body;

    // Handle main image
    let mainImage = 'product1.svg';
    if (req.files && req.files['image'] && req.files['image'][0]) {
      mainImage = req.files['image'][0].filename;
    }

    // Handle additional images
    let additionalImages = [mainImage];
    if (req.files && req.files['images']) {
      additionalImages = req.files['images'].map(file => file.filename);
    }

    // Parse sizes
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        console.log('Error parsing sizes:', e);
      }
    }

    // Parse colors
    let parsedColors = [];
    if (colors) {
      try {
        parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        console.log('Error parsing colors:', e);
      }
    }

    // Parse features
    let parsedFeatures = [];
    if (features) {
      if (typeof features === 'string') {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      } else if (Array.isArray(features)) {
        parsedFeatures = features.filter(f => f);
      }
    }

    const product = new Product({
      name,
      description,
      basePrice: parseFloat(basePrice),
      category,
      image: mainImage,
      images: additionalImages,
      stockQuantity: parseInt(stockQuantity) || 0,
      deliveryTime: parseInt(deliveryTime) || 14,
      sizes: parsedSizes,
      colors: parsedColors,
      features: parsedFeatures,
      createdBy: userId
    });

    await product.save();
    
    // Update user's bundle productsUsed count
    user.businessBundle.productsUsed = (user.businessBundle.productsUsed || 0) + 1;
    await user.save();

    req.flash('success', 'Product added successfully!');
    res.redirect('/business-owner/products');
  } catch (error) {
    console.error('Create product error:', error);
    req.flash('error', 'Failed to add product: ' + error.message);
    res.redirect('/business-owner/add-product');
  }
};

// Show edit product form
exports.getEditProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const product = await Product.findOne({
      _id: productId,
      createdBy: userId // Only allow editing own products
    }).lean();

    if (!product) {
      req.flash('error', 'Product not found or you do not have permission to edit it');
      return res.redirect('/business-owner/products');
    }

    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

    res.render('business-owner/edit-product', {
      title: 'Edit Product',
      product,
      categories: categories.map(c => c.name)
    });
  } catch (error) {
    console.error('Get edit product error:', error);
    req.flash('error', 'Failed to load product');
    res.redirect('/business-owner/products');
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;
    const {
      name,
      description,
      basePrice,
      category,
      stockQuantity,
      deliveryTime,
      sizes,
      colors,
      features
    } = req.body;

    // Find product and verify ownership
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId
    });

    if (!product) {
      req.flash('error', 'Product not found or you do not have permission to edit it');
      return res.redirect('/business-owner/products');
    }

    // Update basic fields
    product.name = name;
    product.description = description;
    product.basePrice = parseFloat(basePrice);
    product.category = category;
    product.stockQuantity = parseInt(stockQuantity) || 0;
    product.deliveryTime = parseInt(deliveryTime) || 14;

    // Update main image if uploaded
    if (req.files && req.files['image'] && req.files['image'][0]) {
      product.image = req.files['image'][0].filename;
    }

    // Update additional images if uploaded
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      product.images = req.files['images'].map(file => file.filename);
    }

    // Parse and update sizes
    if (sizes) {
      try {
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        console.log('Error parsing sizes:', e);
      }
    }

    // Parse and update colors
    if (colors) {
      try {
        product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        console.log('Error parsing colors:', e);
      }
    }

    // Parse and update features
    if (features) {
      if (typeof features === 'string') {
        product.features = features.split(',').map(f => f.trim()).filter(f => f);
      } else if (Array.isArray(features)) {
        product.features = features.filter(f => f);
      }
    }

    await product.save();

    req.flash('success', 'Product updated successfully!');
    res.redirect('/business-owner/products');
  } catch (error) {
    console.error('Update product error:', error);
    req.flash('error', 'Failed to update product: ' + error.message);
    res.redirect(`/business-owner/products/${req.params.id}/edit`);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.params.id;

    const result = await Product.deleteOne({
      _id: productId,
      createdBy: userId // Only allow deleting own products
    });

    if (result.deletedCount === 0) {
      req.flash('error', 'Product not found or you do not have permission to delete it');
    } else {
      req.flash('success', 'Product deleted successfully!');
    }

    res.redirect('/business-owner/products');
  } catch (error) {
    console.error('Delete product error:', error);
    req.flash('error', 'Failed to delete product');
    res.redirect('/business-owner/products');
  }
};

// Income Analytics - Show only business owner's revenue
exports.getIncomeAnalytics = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get business owner's products
    const products = await Product.find({ createdBy: userId }).lean();
    const productIds = products.map(p => p._id);

    // Get orders containing business owner's products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).sort({ createdAt: -1 }).lean();

    // Calculate analytics
    let dailyRevenue = {};
    let monthlyRevenue = {};
    let productRevenue = {};

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayKey = orderDate.toISOString().split('T')[0];
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.productId))) {
          const revenue = item.price * item.quantity;

          // Daily revenue
          dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + revenue;

          // Monthly revenue
          monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + revenue;

          // Product revenue
          const productName = item.name || 'Unknown';
          productRevenue[productName] = (productRevenue[productName] || 0) + revenue;
        }
      });
    });

    // Format data for charts
    const dailyData = Object.keys(dailyRevenue).sort().map(date => ({
      date,
      revenue: dailyRevenue[date].toFixed(2)
    }));

    const monthlyData = Object.keys(monthlyRevenue).sort().map(month => ({
      month,
      revenue: monthlyRevenue[month].toFixed(2)
    }));

    const productData = Object.keys(productRevenue).map(product => ({
      product,
      revenue: productRevenue[product].toFixed(2)
    })).sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

    const totalRevenue = Object.values(productRevenue).reduce((sum, val) => sum + val, 0);

    res.render('business-owner/income-analytics', {
      title: 'Income Analytics',
      dailyData,
      monthlyData,
      productData,
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Income analytics error:', error);
    req.flash('error', 'Failed to load analytics');
    res.redirect('/business-owner');
  }
};
