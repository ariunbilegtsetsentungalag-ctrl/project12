
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.home = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ inStock: -1, stockQuantity: -1 }).limit(8).lean();
    res.render('home', { products: products, title: 'Home' });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('home', { products: [], title: 'Home' });
  }
}

exports.viewProducts = async (req, res) => {
  try {
    console.log('🔍 Loading products with optimized queries...');
    const { q, category, page = 1, sort = 'newest', minPrice, maxPrice, view = 'sections' } = req.query;
    const limit = 12;
    const skip = (parseInt(page) - 1) * limit;
    const filter = { isActive: { $ne: false } };

    // If searching or filtering, show traditional grid view
    const isFiltering = q || (category && category !== 'All') || minPrice || maxPrice;

    // Category filter
    if (category && category.trim() && category !== 'All') {
      filter.category = category.trim();
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
    }

    let products = [];
    let featuredProducts = [];
    let bestSellers = [];
    let newArrivals = [];
    let recommendedProducts = [];
    let totalProducts = 0;
    let totalPages = 1;

    if (isFiltering || view === 'all') {
      // Traditional filtered view
      let query;
      let useTextSearch = false;
      if (q && q.trim()) {
        const searchTerm = q.trim().substring(0, 100);
        
        // First try text search
        const textFilter = { ...filter, $text: { $search: searchTerm } };
        const textCount = await Product.countDocuments(textFilter);
        
        if (textCount > 0) {
          filter.$text = { $search: searchTerm };
          query = Product.find(filter);
          useTextSearch = true;
        } else {
          // Fallback to regex for partial matching
          filter.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ];
          query = Product.find(filter);
        }
      } else {
        query = Product.find(filter);
      }

      totalProducts = await Product.countDocuments(filter);
      totalPages = Math.ceil(totalProducts / limit);

      let sortOption = { inStock: -1, stockQuantity: -1, createdAt: -1 };
      switch (sort) {
        case 'price-low': sortOption = { basePrice: 1, inStock: -1 }; break;
        case 'price-high': sortOption = { basePrice: -1, inStock: -1 }; break;
        case 'newest': sortOption = { createdAt: -1, inStock: -1 }; break;
        case 'popular': sortOption = { stockQuantity: -1, inStock: -1 }; break;
        case 'name-az': sortOption = { name: 1 }; break;
        case 'name-za': sortOption = { name: -1 }; break;
      }

      products = await query
        .select('name description basePrice price image images category sizes colors stock inStock stockQuantity deliveryTime createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      // Sections view - fetch products for each section
      const productFields = 'name description basePrice price image category stockQuantity inStock deliveryTime createdAt';
      
      // Featured/Top Products (high stock, active)
      featuredProducts = await Product.find({ isActive: { $ne: false }, stockQuantity: { $gte: 10 } })
        .select(productFields)
        .sort({ stockQuantity: -1 })
        .limit(8)
        .lean();

      // Best Sellers (simulated by low stock = sold a lot)
      bestSellers = await Product.find({ isActive: { $ne: false }, stockQuantity: { $gte: 1, $lte: 20 } })
        .select(productFields)
        .sort({ stockQuantity: 1 })
        .limit(8)
        .lean();

      // New Arrivals (most recent)
      newArrivals = await Product.find({ isActive: { $ne: false } })
        .select(productFields)
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();

      // Recommended (random mix with good stock)
      recommendedProducts = await Product.aggregate([
        { $match: { isActive: { $ne: false }, stockQuantity: { $gte: 5 } } },
        { $sample: { size: 8 } },
        { $project: { name: 1, description: 1, basePrice: 1, price: 1, image: 1, category: 1, stockQuantity: 1, inStock: 1, deliveryTime: 1 } }
      ]);

      totalProducts = await Product.countDocuments({ isActive: { $ne: false } });
    }

    // Get categories
    const availableCategories = await Category.find({ isActive: true })
      .select('name')
      .sort({ name: 1 })
      .lean();
    const categoryNames = availableCategories.map(cat => cat.name);

    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: null, minPrice: { $min: '$basePrice' }, maxPrice: { $max: '$basePrice' } } }
    ]);
    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 1000 };

    res.render('shop', {
      products,
      featuredProducts,
      bestSellers,
      newArrivals,
      recommendedProducts,
      isFiltering,
      title: 'Shop',
      currentSearch: q || '',
      currentCategory: category || 'All',
      currentSort: sort,
      currentMinPrice: minPrice || '',
      currentMaxPrice: maxPrice || '',
      priceRange,
      availableCategories: categoryNames,
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
      hasMore: parseInt(page) < totalPages
    });
  } catch (error) {
    console.error('Shop page error:', error);
    res.render('shop', {
      products: [],
      featuredProducts: [],
      bestSellers: [],
      newArrivals: [],
      recommendedProducts: [],
      isFiltering: false,
      title: 'Shop',
      currentSearch: '',
      currentCategory: 'All',
      currentSort: 'newest',
      currentMinPrice: '',
      currentMaxPrice: '',
      priceRange: { minPrice: 0, maxPrice: 1000 },
      availableCategories: [],
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0,
      hasMore: false
    });
  }
}

exports.viewProduct = async (req, res) => {
  try {
    console.log('📖 Loading single product with optimized query...');
    let product;
    const id = req.params.id;
    
    // Optimized product lookup with only needed fields
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id)
        .select('name description basePrice price image images category sizes colors features stock inStock stockQuantity deliveryTime createdAt')
        .lean();
    } else {
      product = await Product.findOne({ productId: id })
        .select('name description basePrice price image images category sizes colors features stock inStock stockQuantity deliveryTime createdAt')
        .lean();
    }
    
    if (!product) {
      return res.status(404).render('404', { title: '404 - Product Not Found' });
    }
    
    // Fetch related products from the same category (Amazon-style)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // Exclude current product
    })
    .select('name description basePrice price image stockQuantity deliveryTime')
    .sort({ stockQuantity: -1, createdAt: -1 })
    .limit(4)
    .lean();
    
    res.render('single-product', { 
      product: product, 
      relatedProducts: relatedProducts,
      title: product.name 
    });
  } catch (error) {
    console.error('Product view error:', error);
    res.status(404).render('404', { title: '404 - Product Not Found' });
  }
}


exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 Executing optimized search with text indexes...');
    const { q, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: { $ne: false } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50

    // Add category filter if specified
    if (category && category.trim() && category !== 'All') {
      filter.category = category.trim();
    }

    let products;
    let totalProducts;

    if (q && q.trim()) {
      const searchTerm = q.trim().substring(0, 100);
      
      // First try text search for exact/full word matches
      const textFilter = { ...filter, $text: { $search: searchTerm } };
      totalProducts = await Product.countDocuments(textFilter);
      
      if (totalProducts > 0) {
        // Use text search results
        products = await Product.find(textFilter)
          .select('name description basePrice price image images category sizes colors stock inStock stockQuantity deliveryTime')
          .sort({ score: { $meta: 'textScore' }, inStock: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();
      } else {
        // Fallback to regex for partial matching (live search as user types)
        const regexFilter = {
          ...filter,
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ]
        };
        
        totalProducts = await Product.countDocuments(regexFilter);
        products = await Product.find(regexFilter)
          .select('name description basePrice price image images category sizes colors stock inStock stockQuantity deliveryTime')
          .sort({ inStock: -1, stockQuantity: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean();
      }
    } else {
      totalProducts = await Product.countDocuments(filter);
      products = await Product.find(filter)
        .select('name description basePrice price image images category sizes colors stock inStock stockQuantity deliveryTime')
        .sort({ inStock: -1, stockQuantity: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    // Get available categories from database
    const availableCategories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const categoryNames = availableCategories.map(cat => cat.name);

    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=30',
      'ETag': `"${products.length}-${page}"`
    });

    res.json({
      products,
      availableCategories: categoryNames,
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limitNum),
      totalProducts,
      hasMore: skip + products.length < totalProducts
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      products: [],
      availableCategories: [],
      success: false,
      error: 'Search failed',
      currentPage: 1,
      totalPages: 0,
      hasMore: false
    });
  }
}

exports.getProductById = async (productId) => {
  try {
    return await Product.findById(productId).lean();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}