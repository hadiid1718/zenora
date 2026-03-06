import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
    default: '',
  },
  type: {
    type: String,
    enum: ['video', 'article', 'quiz'],
    required: true,
  },
  video: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    duration: { type: Number, default: 0 }, // seconds
  },
  article: {
    content: { type: String, default: '' },
  },
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: ['pdf', 'link', 'file'] },
    },
  ],
  isPreview: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number,
    default: 0,
  },
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 500,
    default: '',
  },
  lessons: [lessonSchema],
  sortOrder: {
    type: Number,
    default: 0,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    subtitle: {
      type: String,
      maxlength: 300,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: 5000,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    promoVideo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'all-levels',
    },
    language: {
      type: String,
      default: 'English',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    modules: [moduleSchema],
    learningOutcomes: [
      {
        type: String,
        maxlength: 200,
      },
    ],
    requirements: [
      {
        type: String,
        maxlength: 200,
      },
    ],
    targetAudience: [
      {
        type: String,
        maxlength: 200,
      },
    ],
    tags: [{ type: String }],
    // Stats
    totalStudents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // seconds
    totalLessons: { type: Number, default: 0 },
    totalModules: { type: Number, default: 0 },
    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
    // Status
    status: {
      type: String,
      enum: [
        'draft',
        'pending',
        'approved',
        'rejected',
        'published',
        'archived',
      ],
      default: 'draft',
    },
    rejectionReason: { type: String, default: '' },
    publishedAt: Date,
    approvedAt: Date,
    // Featured
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    // SEO
    metaTitle: { type: String, maxlength: 70, default: '' },
    metaDescription: { type: String, maxlength: 160, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ price: 1 });
courseSchema.index({ isFeatured: 1, status: 1 });
courseSchema.index({
  title: 'text',
  subtitle: 'text',
  description: 'text',
  tags: 'text',
});

// Calculate totals before save
courseSchema.pre('save', function (next) {
  if (this.isModified('modules')) {
    let totalLessons = 0;
    let totalDuration = 0;
    this.modules.forEach(mod => {
      totalLessons += mod.lessons.length;
      mod.lessons.forEach(lesson => {
        totalDuration += lesson.duration || 0;
      });
    });
    this.totalLessons = totalLessons;
    this.totalModules = this.modules.length;
    this.totalDuration = totalDuration;
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
