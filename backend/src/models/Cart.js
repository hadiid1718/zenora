import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
