import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildPaginationMeta } from '../utils/helpers.js';

// @desc    Instructor dashboard
// @route   GET /api/v1/instructor/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalCourses,
    publishedCourses,
    totalStudents,
    totalReviews,
    recentEnrollments,
    monthlyRevenue,
  ] = await Promise.all([
    Course.countDocuments({ instructor: req.user._id }),
    Course.countDocuments({ instructor: req.user._id, status: 'published' }),
    Enrollment.countDocuments({
      course: {
        $in: await Course.find({ instructor: req.user._id }).distinct('_id'),
      },
    }),
    Review.countDocuments({
      course: {
        $in: await Course.find({ instructor: req.user._id }).distinct('_id'),
      },
    }),
    Enrollment.find({
      course: {
        $in: await Course.find({ instructor: req.user._id }).distinct('_id'),
      },
    })
      .populate('student', 'firstName lastName avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Order.aggregate([
      {
        $match: {
          status: 'completed',
          'instructorEarnings.instructor': req.user._id,
        },
      },
      {
        $unwind: '$instructorEarnings',
      },
      {
        $match: {
          'instructorEarnings.instructor': req.user._id,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$instructorEarnings.amount' },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
  ]);

  ApiResponse.success(
    {
      stats: {
        totalCourses,
        publishedCourses,
        totalStudents,
        totalReviews,
        totalRevenue: req.user.totalRevenue || 0,
        availableBalance: req.user.availableBalance || 0,
      },
      recentEnrollments,
      monthlyRevenue,
    },
    'Dashboard retrieved'
  ).send(res);
});

// @desc    Get instructor's course analytics
// @route   GET /api/v1/instructor/courses/:id/analytics
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  const [enrollments, reviews, revenue] = await Promise.all([
    Enrollment.countDocuments({ course: course._id }),
    Review.find({ course: course._id })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $match: { 'items.course': course._id } },
      { $group: { _id: null, total: { $sum: '$items.price' } } },
    ]),
  ]);

  ApiResponse.success(
    {
      course: {
        title: course.title,
        totalStudents: course.totalStudents,
        averageRating: course.averageRating,
        totalRatings: course.totalRatings,
        ratingDistribution: course.ratingDistribution,
      },
      enrollments,
      recentReviews: reviews,
      totalRevenue: revenue[0]?.total || 0,
    },
    'Course analytics retrieved'
  ).send(res);
});

// @desc    Create coupon
// @route   POST /api/v1/instructor/coupons
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    maxDiscount,
    minPurchase,
    course,
    usageLimit,
    startsAt,
    expiresAt,
  } = req.body;

  // Verify course ownership if specified
  if (course) {
    const courseDoc = await Course.findById(course);
    if (
      !courseDoc ||
      courseDoc.instructor.toString() !== req.user._id.toString()
    ) {
      throw ApiError.forbidden('Not authorized');
    }
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    type,
    value,
    maxDiscount,
    minPurchase,
    course,
    instructor: req.user._id,
    usageLimit,
    startsAt,
    expiresAt,
  });

  new ApiResponse(201, { coupon }, 'Coupon created').send(res);
});

// @desc    Get instructor's coupons
// @route   GET /api/v1/instructor/coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ instructor: req.user._id })
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .lean();

  ApiResponse.success({ coupons }, 'Coupons retrieved').send(res);
});

// @desc    Delete coupon
// @route   DELETE /api/v1/instructor/coupons/:id
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  if (coupon.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  await Coupon.findByIdAndDelete(req.params.id);

  ApiResponse.success(null, 'Coupon deleted').send(res);
});

// @desc    Request withdrawal
// @route   POST /api/v1/instructor/withdrawals
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, method, accountDetails } = req.body;
  const minAmount = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT) || 50;

  if (amount < minAmount) {
    throw ApiError.badRequest(`Minimum withdrawal amount is $${minAmount}`);
  }

  if (amount > req.user.availableBalance) {
    throw ApiError.badRequest('Insufficient balance');
  }

  const pendingWithdrawal = await Withdrawal.findOne({
    instructor: req.user._id,
    status: { $in: ['pending', 'processing'] },
  });
  if (pendingWithdrawal) {
    throw ApiError.badRequest('You already have a pending withdrawal');
  }

  const withdrawal = await Withdrawal.create({
    instructor: req.user._id,
    amount,
    method,
    accountDetails,
  });

  new ApiResponse(201, { withdrawal }, 'Withdrawal requested').send(res);
});

// @desc    Get withdrawal history
// @route   GET /api/v1/instructor/withdrawals
export const getWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find({ instructor: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  ApiResponse.success({ withdrawals }, 'Withdrawals retrieved').send(res);
});

// @desc    Reply to review
// @route   POST /api/v1/instructor/reviews/:id/reply
export const replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('course');
  if (!review) throw ApiError.notFound('Review not found');
  if (review.course.instructor.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  review.instructorReply = {
    comment: req.body.comment,
    repliedAt: new Date(),
  };
  await review.save();

  ApiResponse.success({ review }, 'Reply added').send(res);
});
