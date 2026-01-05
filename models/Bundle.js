const mongoose = require('mongoose');

// Bundle pricing configuration
const BUNDLE_TIERS = {
  starter: {
    name: 'Starter',
    products: 5,
    price: 5,
    description: 'Perfect for trying out our platform',
    color: '#10b981',
    icon: 'fa-seedling'
  },
  basic: {
    name: 'Basic',
    products: 10,
    price: 10,
    description: 'Great for small businesses',
    color: '#3b82f6',
    icon: 'fa-store'
  },
  standard: {
    name: 'Standard',
    products: 15,
    price: 15,
    description: 'Most popular choice',
    color: '#8b5cf6',
    icon: 'fa-building',
    popular: true
  },
  premium: {
    name: 'Premium',
    products: 20,
    price: 20,
    description: 'For growing businesses',
    color: '#f59e0b',
    icon: 'fa-crown'
  },
  unlimited: {
    name: 'Unlimited',
    products: 999,
    price: 50,
    description: 'No limits, full access',
    color: '#ef4444',
    icon: 'fa-infinity'
  }
};

const bundlePurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tier: {
    type: String,
    enum: ['starter', 'basic', 'standard', 'premium', 'unlimited'],
    required: true
  },
  productsAllowed: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  }
});

// Static method to get all bundle tiers
bundlePurchaseSchema.statics.getBundleTiers = function() {
  return BUNDLE_TIERS;
};

// Static method to get a specific tier info
bundlePurchaseSchema.statics.getTierInfo = function(tier) {
  return BUNDLE_TIERS[tier] || null;
};

// Indexes
bundlePurchaseSchema.index({ userId: 1 });
bundlePurchaseSchema.index({ purchaseDate: -1 });
bundlePurchaseSchema.index({ paymentStatus: 1 });

const Bundle = mongoose.model('Bundle', bundlePurchaseSchema);

// Export both the model and the tier configuration
module.exports = Bundle;
module.exports.BUNDLE_TIERS = BUNDLE_TIERS;
