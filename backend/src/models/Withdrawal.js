import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: 1,
    },
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe_connect'],
      required: true,
    },
    accountDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
    },
    processedAt: Date,
    rejectionReason: String,
    transactionId: String,
  },
  {
    timestamps: true,
  }
);

withdrawalSchema.index({ instructor: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
