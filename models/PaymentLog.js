const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    parsed: {
        amount: Number,
        paymentCode: String,  // Extracted from "Utga:" field
        bankName: String,
        date: String,
        isIncoming: Boolean,
        isValid: Boolean
    },
    matched: {
        type: Boolean,
        default: false
    },
    matchedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    matchedAutomatically: {
        type: Boolean,
        default: false
    },
    matchedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for quick lookups
paymentLogSchema.index({ matched: 1, createdAt: -1 });
paymentLogSchema.index({ matchedOrderId: 1 });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
