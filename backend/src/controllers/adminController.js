import Course from '../models/Course.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Withdrawal from '../models/Withdrawal.js';
import AuditLog from '../models/AuditLog.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildPaginationMeta, slugify } from '../utils/helpers.js';
import { cacheDel } from '../config/redis.js';
import { COURSE_STATUS, INSTRUCTOR_STATUS } from '../utils/constants.js';

// @desc    Admin dashboard stats
// @route   GET /api/v1/admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalInstructors,
    totalStudents,
    totalCourses,
    publishedCourses,
    pendingCourses,
    pendingInstructors,
    totalOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Course.countDocuments({ status: COURSE_STATUS.PUBLISHED }),
    Course.countDocuments({ status: COURSE_STATUS.PENDING }),
    User.countDocuments({ instructorStatus: INSTRUCTOR_STATUS.PENDING }),
    Order.countDocuments({ status: 'completed' }),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]),
    Order.find({ status: 'completed' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Revenue over the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$finalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  ApiResponse.success(
    {
      stats: {
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses,
        publishedCourses,
        pendingCourses,
        pendingInstructors,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      monthlyRevenue,
      recentOrders,
    },
    'Dashboard data retrieved'
  ).send(res);
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    {
      users,
      pagination: buildPaginationMeta(total, pageNum, limitNum),
    },
    'Users retrieved'
  ).send(res);
});

// @desc    Toggle user status
// @route   PUT /api/v1/admin/users/:id/toggle-status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin')
    throw ApiError.forbidden('Cannot modify admin account');

  user.isActive = !user.isActive;
  await user.save();

  await AuditLog.create({
    user: req.user._id,
    action: 'admin_action',
    resource: 'user',
    resourceId: user._id,
    details: { action: user.isActive ? 'activated' : 'deactivated' },
  });

  ApiResponse.success(
    { user },
    `User ${user.isActive ? 'activated' : 'deactivated'}`
  ).send(res);
});

// @desc    Get pending instructor applications
// @route   GET /api/v1/admin/instructors/pending
export const getPendingInstructors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = { instructorStatus: INSTRUCTOR_STATUS.PENDING };
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select(
      'firstName lastName email bio headline expertise instructorAppliedAt avatar'
    )
    .sort({ instructorAppliedAt: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    { instructors: users, pagination: buildPaginationMeta(total, pageNum, limitNum) },
    'Pending instructors retrieved'
  ).send(res);
});

// @desc    Approve instructor
// @route   PUT /api/v1/admin/instructors/:id/approve
export const approveInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.instructorStatus !== INSTRUCTOR_STATUS.PENDING) {
    throw ApiError.badRequest('No pending application found');
  }

  user.role = 'instructor';
  user.instructorStatus = INSTRUCTOR_STATUS.APPROVED;
  user.instructorApprovedAt = new Date();
  await user.save();

  await Notification.create({
    user: user._id,
    type: 'instructor_approved',
    title: 'Instructor Application Approved',
    message:
      'Congratulations! Your instructor application has been approved. You can now create courses.',
    link: '/instructor/dashboard',
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'instructor_approve',
    resource: 'user',
    resourceId: user._id,
  });

  ApiResponse.success({ user }, 'Instructor approved').send(res);
});

// @desc    Reject instructor
// @route   PUT /api/v1/admin/instructors/:id/reject
export const rejectInstructor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  user.instructorStatus = INSTRUCTOR_STATUS.REJECTED;
  await user.save();

  await Notification.create({
    user: user._id,
    type: 'instructor_rejected',
    title: 'Instructor Application Rejected',
    message: reason || 'Your instructor application has been rejected.',
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'instructor_reject',
    resource: 'user',
    resourceId: user._id,
    details: { reason },
  });

  ApiResponse.success(null, 'Instructor rejected').send(res);
});

// @desc    Get pending courses
// @route   GET /api/v1/admin/courses/pending
export const getPendingCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = { status: COURSE_STATUS.PENDING };
  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .populate('instructor', 'firstName lastName email avatar')
    .populate('category', 'name')
    .sort({ createdAt: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    { courses, pagination: buildPaginationMeta(total, pageNum, limitNum) },
    'Pending courses retrieved'
  ).send(res);
});

// @desc    Approve course
// @route   PUT /api/v1/admin/courses/:id/approve
export const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.status !== COURSE_STATUS.PENDING) {
    throw ApiError.badRequest('Course is not pending review');
  }

  course.status = COURSE_STATUS.PUBLISHED;
  course.approvedAt = new Date();
  course.publishedAt = new Date();
  await course.save();

  await Notification.create({
    user: course.instructor,
    type: 'course_approved',
    title: 'Course Approved',
    message: `Your course "${course.title}" has been approved and published!`,
    link: `/courses/${course.slug}`,
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'course_approve',
    resource: 'course',
    resourceId: course._id,
  });

  await cacheDel('courses:*');
  await cacheDel(`course:${course.slug}`);

  ApiResponse.success({ course }, 'Course approved and published').send(res);
});

// @desc    Reject course
// @route   PUT /api/v1/admin/courses/:id/reject
export const rejectCourse = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  course.status = COURSE_STATUS.REJECTED;
  course.rejectionReason = reason || '';
  await course.save();

  await Notification.create({
    user: course.instructor,
    type: 'course_rejected',
    title: 'Course Rejected',
    message: `Your course "${course.title}" has been rejected. Reason: ${reason || 'Not specified'}`,
    link: `/instructor/courses/${course._id}`,
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'course_reject',
    resource: 'course',
    resourceId: course._id,
    details: { reason },
  });

  ApiResponse.success(null, 'Course rejected').send(res);
});

// @desc    Manage categories
// @route   POST /api/v1/admin/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, icon, sortOrder } = req.body;

  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    parent,
    icon,
    sortOrder,
  });

  await cacheDel('categories:*');

  new ApiResponse(201, { category }, 'Category created').send(res);
});

// @desc    Update category
// @route   PUT /api/v1/admin/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, sortOrder, isActive } = req.body;
  const updates = {};
  if (name) {
    updates.name = name;
    updates.slug = slugify(name);
  }
  if (description !== undefined) updates.description = description;
  if (icon !== undefined) updates.icon = icon;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (isActive !== undefined) updates.isActive = isActive;

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Category not found');

  await cacheDel('categories:*');

  ApiResponse.success({ category }, 'Category updated').send(res);
});

// @desc    Get audit logs
// @route   GET /api/v1/admin/audit-logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, action, resource } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};
  if (action) filter.action = action;
  if (resource) filter.resource = resource;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    {
      logs,
      pagination: buildPaginationMeta(total, pageNum, limitNum),
    },
    'Audit logs retrieved'
  ).send(res);
});

// @desc    Get withdrawal requests
// @route   GET /api/v1/admin/withdrawals
export const getWithdrawals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};
  if (status) filter.status = status;

  const total = await Withdrawal.countDocuments(filter);
  const withdrawals = await Withdrawal.find(filter)
    .populate('instructor', 'firstName lastName email availableBalance')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    { withdrawals, pagination: buildPaginationMeta(total, pageNum, limitNum) },
    'Withdrawals retrieved'
  ).send(res);
});

// @desc    Process withdrawal
// @route   PUT /api/v1/admin/withdrawals/:id/process
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { action, reason, transactionId } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw ApiError.notFound('Withdrawal not found');

  if (action === 'approve') {
    withdrawal.status = 'completed';
    withdrawal.processedAt = new Date();
    withdrawal.transactionId = transactionId;
    await withdrawal.save();

    await User.findByIdAndUpdate(withdrawal.instructor, {
      $inc: { availableBalance: -withdrawal.amount },
    });
  } else {
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    await withdrawal.save();
  }

  await AuditLog.create({
    user: req.user._id,
    action: 'withdrawal_process',
    resource: 'withdrawal',
    resourceId: withdrawal._id,
    details: { action, reason },
  });

  ApiResponse.success({ withdrawal }, `Withdrawal ${action}d`).send(res);
});
