import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 200,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: 2000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    instructorReply: {
      comment: { type: String, maxlength: 1000 },
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });

// Static method to calculate average rating for a course
reviewSchema.statics.calcAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        dist1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        dist2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        dist3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        dist4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        dist5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length > 0) {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].totalRatings,
      ratingDistribution: {
        1: stats[0].dist1,
        2: stats[0].dist2,
        3: stats[0].dist3,
        4: stats[0].dist4,
        5: stats[0].dist5,
      },
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.course);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
