import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ student: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
