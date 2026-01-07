const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  promoCode: {
    code: String,
    discountAmount: {
      type: Number,
      default: 0
    },
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode'
    }
  },
  totalAmount: Number,
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivering', 'Delivered'],
    default: 'Processing'
  },
  estimatedDeliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String
  },
  // Unique payment code for bank transfer matching (e.g., "ORD-A7X9")
  // Customer includes this in their bank transfer "Utga" field
  paymentCode: {
    type: String,
    unique: true,
    sparse: true  // Allow null values, only enforce uniqueness when set
  },
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    amount: Number,
    paymentCode: String,  // The code extracted from SMS "Utga" field
    senderName: String,
    bankName: String,
    receivedAt: Date,
    rawSMS: String,
    verifiedAutomatically: Boolean,
    manuallyMatched: Boolean,
    matchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
});

// Indexes for analytics queries
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ 'products.productId': 1 });
orderSchema.index({ paymentCode: 1 });  // For matching SMS payments
orderSchema.index({ paymentStatus: 1 }); // For filtering pending payments

module.exports = mongoose.model('Order', orderSchema);