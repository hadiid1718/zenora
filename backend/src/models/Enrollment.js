import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    progress: {
      completedLessons: [
        {
          lessonId: mongoose.Schema.Types.ObjectId,
          moduleId: mongoose.Schema.Types.ObjectId,
          completedAt: { type: Date, default: Date.now },
        },
      ],
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastAccessedLesson: {
        lessonId: mongoose.Schema.Types.ObjectId,
        moduleId: mongoose.Schema.Types.ObjectId,
      },
      lastAccessedAt: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, createdAt: -1 });
enrollmentSchema.index({ course: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
