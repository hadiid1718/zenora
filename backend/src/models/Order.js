import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        instructor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    payment: {
      stripeSessionId: String,
      stripePaymentIntentId: String,
      method: {
        type: String,
        enum: ['stripe', 'free'],
        default: 'stripe',
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Revenue split
    platformFee: {
      type: Number,
      default: 0,
    },
    instructorEarnings: [
      {
        instructor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: Number,
        courseId: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'payment.stripeSessionId': 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
