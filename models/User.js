const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'product_manager', 'business_owner'],
    default: 'customer'
  },
  permissions: {
    type: [String],
    default: []
  },
  // Profile reference
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  // Business Owner Bundle
  businessBundle: {
    tier: {
      type: String,
      enum: ['none', 'starter', 'basic', 'standard', 'premium', 'unlimited'],
      default: 'none'
    },
    productsAllowed: {
      type: Number,
      default: 0
    },
    productsUsed: {
      type: Number,
      default: 0
    },
    purchaseDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    purchaseHistory: [{
      tier: String,
      productsAllowed: Number,
      price: Number,
      purchaseDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user with populated profile
userSchema.methods.getWithProfile = function() {
  return this.populate('profile');
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find user with profile
userSchema.statics.findWithProfile = function(conditions) {
  return this.findOne(conditions).populate('profile');
};

// Indexes for performance
// Note: email and username already have unique indexes from schema definition
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);