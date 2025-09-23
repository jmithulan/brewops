import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderReference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true
        },
        city: {
          type: String,
          required: true,
          trim: true
        },
        postalCode: {
          type: String,
          required: true,
          trim: true
        },
        country: {
          type: String,
          required: true,
          trim: true,
          default: 'Sri Lanka'
        }
      }
    },
    items: [
      {
        productId: {
          type: String,
          trim: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDetails: {
      provider: {
        type: String,
        enum: ['stripe', 'cash', 'bank_transfer'],
        default: 'stripe'
      },
      sessionId: String,
      transactionId: String,
      paymentDate: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Create virtual for formatted order date
orderSchema.virtual('formattedOrderDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to check if an order is fully paid
orderSchema.methods.isPaid = function() {
  return this.paymentStatus === 'paid';
};

// Static method to find recent orders
orderSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to calculate order statistics
orderSchema.statics.getOrderStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
  return stats;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;