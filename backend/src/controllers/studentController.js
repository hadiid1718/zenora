import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Certificate from '../models/Certificate.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  buildPaginationMeta,
  generateCertificateNumber,
} from '../utils/helpers.js';

// @desc    Get enrolled courses
// @route   GET /api/v1/student/courses
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const total = await Enrollment.countDocuments({ student: req.user._id });
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select:
        'title slug thumbnail totalDuration totalLessons instructor averageRating',
      populate: { path: 'instructor', select: 'firstName lastName' },
    })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    {
      enrollments,
      pagination: buildPaginationMeta(total, pageNum, limitNum),
    },
    'Enrolled courses retrieved'
  ).send(res);
});

// @desc    Get course progress (with full content for enrolled user)
// @route   GET /api/v1/student/courses/:courseId
export const getCourseContent = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course');
  }

  const course = await Course.findById(req.params.courseId)
    .populate('instructor', 'firstName lastName avatar')
    .lean();

  if (!course) throw ApiError.notFound('Course not found');

  ApiResponse.success(
    {
      course,
      enrollment,
    },
    'Course content retrieved'
  ).send(res);
});

// @desc    Mark lesson as completed
// @route   POST /api/v1/student/courses/:courseId/lessons/:lessonId/complete
export const completeLesson = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { moduleId } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (!enrollment) throw ApiError.forbidden('Not enrolled');

  const alreadyCompleted = enrollment.progress.completedLessons.some(
    l => l.lessonId.toString() === lessonId
  );

  if (!alreadyCompleted) {
    enrollment.progress.completedLessons.push({
      lessonId,
      moduleId,
      completedAt: new Date(),
    });
  }

  enrollment.progress.lastAccessedLesson = { lessonId, moduleId };
  enrollment.progress.lastAccessedAt = new Date();

  // Calculate progress percentage
  const course = await Course.findById(courseId).lean();
  const totalLessons = course.totalLessons || 1;
  enrollment.progress.percentage = Math.round(
    (enrollment.progress.completedLessons.length / totalLessons) * 100
  );

  // Check if completed
  if (enrollment.progress.percentage >= 100) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();

    // Auto-generate certificate
    const certNumber = generateCertificateNumber();
    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      enrollment: enrollment._id,
      certificateNumber: certNumber,
    });

    enrollment.certificateId = certificate._id;

    await Notification.create({
      user: req.user._id,
      type: 'certificate',
      title: 'Course Completed!',
      message: `Congratulations! You completed "${course.title}". Your certificate is ready.`,
      link: `/certificates/${certificate._id}`,
    });
  }

  await enrollment.save();

  ApiResponse.success({ enrollment }, 'Lesson completed').send(res);
});

// @desc    Add to cart
// @route   POST /api/v1/student/cart
export const addToCart = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course || course.status !== 'published') {
    throw ApiError.notFound('Course not found');
  }

  // Check if already enrolled
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });
  if (enrollment) throw ApiError.badRequest('Already enrolled in this course');

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ course: courseId }],
    });
  } else {
    const exists = cart.items.some(item => item.course.toString() === courseId);
    if (exists) throw ApiError.badRequest('Course already in cart');

    cart.items.push({ course: courseId });
    await cart.save();
  }

  ApiResponse.success({ cart }, 'Added to cart').send(res);
});

// @desc    Get cart
// @route   GET /api/v1/student/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.course',
      select:
        'title slug thumbnail price originalPrice instructor averageRating totalStudents',
      populate: { path: 'instructor', select: 'firstName lastName' },
    })
    .lean();

  if (!cart) {
    cart = { items: [] };
  }

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + (item.course?.price || 0),
    0
  );

  ApiResponse.success(
    {
      cart,
      totalPrice,
      itemCount: cart.items.length,
    },
    'Cart retrieved'
  ).send(res);
});

// @desc    Remove from cart
// @route   DELETE /api/v1/student/cart/:courseId
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter(
    item => item.course.toString() !== req.params.courseId
  );
  await cart.save();

  ApiResponse.success({ cart }, 'Removed from cart').send(res);
});

// @desc    Toggle wishlist
// @route   POST /api/v1/student/wishlist/:courseId
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;

  const index = user.wishlist.indexOf(courseId);
  if (index > -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(courseId);
  }

  await user.save();

  ApiResponse.success(
    {
      wishlist: user.wishlist,
      isWishlisted: index === -1,
    },
    index > -1 ? 'Removed from wishlist' : 'Added to wishlist'
  ).send(res);
});

// @desc    Get wishlist
// @route   GET /api/v1/student/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      select:
        'title slug thumbnail price originalPrice instructor averageRating totalStudents',
      populate: { path: 'instructor', select: 'firstName lastName' },
    })
    .lean();

  ApiResponse.success(
    { wishlist: user.wishlist || [] },
    'Wishlist retrieved'
  ).send(res);
});

// @desc    Create review
// @route   POST /api/v1/student/reviews/:courseId
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) throw ApiError.forbidden('Must be enrolled to review');

  const existingReview = await Review.findOne({
    user: req.user._id,
    course: req.params.courseId,
  });
  if (existingReview) throw ApiError.conflict('Already reviewed this course');

  const review = await Review.create({
    user: req.user._id,
    course: req.params.courseId,
    rating,
    comment,
    title,
    isVerifiedPurchase: true,
  });

  // Notify instructor
  const course = await Course.findById(req.params.courseId);
  await Notification.create({
    user: course.instructor,
    type: 'review',
    title: 'New Review',
    message: `${req.user.firstName} left a ${rating}-star review on "${course.title}"`,
    link: `/courses/${course.slug}`,
  });

  new ApiResponse(201, { review }, 'Review created').send(res);
});

// @desc    Get reviews for a course
// @route   GET /api/v1/student/reviews/:courseId
export const getCourseReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let sortOption = { createdAt: -1 };
  if (sort === 'helpful') sortOption = { helpfulCount: -1 };
  if (sort === 'rating-high') sortOption = { rating: -1 };
  if (sort === 'rating-low') sortOption = { rating: 1 };

  const total = await Review.countDocuments({ course: req.params.courseId });
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'firstName lastName avatar')
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    {
      reviews,
      pagination: buildPaginationMeta(total, pageNum, limitNum),
    },
    'Reviews retrieved'
  ).send(res);
});

// @desc    Get certificates
// @route   GET /api/v1/student/certificates
export const getCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ student: req.user._id })
    .populate('course', 'title slug thumbnail instructor')
    .sort({ issuedAt: -1 })
    .lean();

  ApiResponse.success({ certificates }, 'Certificates retrieved').send(res);
});

// @desc    Get notifications
// @route   GET /api/v1/student/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  ApiResponse.success(
    { notifications, unreadCount },
    'Notifications retrieved'
  ).send(res);
});

// @desc    Mark notification as read
// @route   PUT /api/v1/student/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  ApiResponse.success(null, 'Notification marked as read').send(res);
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/student/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  ApiResponse.success(null, 'All notifications marked as read').send(res);
});
