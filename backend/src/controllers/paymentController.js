import stripe from '../config/stripe.js';
import Course from '../models/Course.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { PLATFORM_FEE_PERCENTAGE } from '../utils/constants.js';
import { calculateRevenueSplit } from '../utils/helpers.js';

// @desc    Create checkout session
// @route   POST /api/v1/payments/checkout
export const createCheckout = asyncHandler(async (req, res) => {
  const { courseIds, couponCode } = req.body;

  if (!courseIds || courseIds.length === 0) {
    throw ApiError.badRequest('At least one course is required');
  }

  // Check if already enrolled
  const existingEnrollments = await Enrollment.find({
    student: req.user._id,
    course: { $in: courseIds },
  });

  if (existingEnrollments.length > 0) {
    throw ApiError.badRequest(
      'You are already enrolled in one or more of these courses'
    );
  }

  const courses = await Course.find({
    _id: { $in: courseIds },
    status: 'published',
  }).populate('instructor', 'firstName lastName');

  if (courses.length !== courseIds.length) {
    throw ApiError.badRequest('One or more courses not found or not available');
  }

  const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);
  let discountAmount = 0;
  let coupon = null;

  // Apply coupon
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      startsAt: { $lte: new Date() },
      expiresAt: { $gte: new Date() },
    });

    if (coupon) {
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw ApiError.badRequest('Coupon usage limit reached');
      }
      if (coupon.usedBy.includes(req.user._id)) {
        throw ApiError.badRequest('Coupon already used');
      }

      if (coupon.type === 'percentage') {
        discountAmount = (totalAmount * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = Math.min(coupon.value, totalAmount);
      }
    }
  }

  const finalAmount = Math.max(totalAmount - discountAmount, 0);

  // Handle free courses
  if (finalAmount === 0) {
    const order = await Order.create({
      user: req.user._id,
      items: courses.map(c => ({
        course: c._id,
        price: 0,
        instructor: c.instructor._id,
      })),
      totalAmount,
      discountAmount,
      finalAmount: 0,
      coupon: coupon?._id,
      payment: { method: 'free', status: 'completed', paidAt: new Date() },
      status: 'completed',
    });

    // Create enrollments
    await Promise.all(
      courses.map(course =>
        Enrollment.create({
          student: req.user._id,
          course: course._id,
          order: order._id,
        })
      )
    );

    // Update student
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: { $each: courseIds } },
    });

    // Update course stats
    await Promise.all(
      courses.map(course =>
        Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } })
      )
    );

    return ApiResponse.success({ order }, 'Enrolled successfully (free)').send(
      res
    );
  }

  // Create Stripe session
  const lineItems = courses.map(course => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: course.title,
        description: course.subtitle || course.description.substring(0, 200),
      },
      unit_amount: Math.round(
        (course.price - discountAmount / courses.length) * 100
      ),
    },
    quantity: 1,
  }));

  const order = await Order.create({
    user: req.user._id,
    items: courses.map(c => ({
      course: c._id,
      price: c.price,
      instructor: c.instructor._id,
    })),
    totalAmount,
    discountAmount,
    finalAmount,
    coupon: coupon?._id,
    payment: { method: 'stripe', status: 'pending' },
    status: 'pending',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.payment.stripeSessionId = session.id;
  await order.save();

  ApiResponse.success(
    {
      sessionId: session.id,
      sessionUrl: session.url,
    },
    'Checkout session created'
  ).send(res);
});

// @desc    Stripe webhook
// @route   POST /api/v1/payments/webhook
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw ApiError.badRequest(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const order = await Order.findById(orderId).populate('items.course');
    if (!order) return res.status(200).json({ received: true });

    order.payment.status = 'completed';
    order.payment.stripePaymentIntentId = session.payment_intent;
    order.payment.paidAt = new Date();
    order.status = 'completed';

    // Calculate revenue split
    const platformFeeRate = parseInt(process.env.PLATFORM_FEE_PERCENTAGE) || 30;
    let totalPlatformFee = 0;
    const instructorEarnings = [];

    for (const item of order.items) {
      const platformFee =
        Math.round(((item.price * platformFeeRate) / 100) * 100) / 100;
      const instructorEarning =
        Math.round((item.price - platformFee) * 100) / 100;
      totalPlatformFee += platformFee;

      instructorEarnings.push({
        instructor: item.instructor,
        amount: instructorEarning,
        courseId: item.course,
      });

      // Update instructor balance
      await User.findByIdAndUpdate(item.instructor, {
        $inc: {
          totalRevenue: instructorEarning,
          availableBalance: instructorEarning,
          totalStudents: 1,
        },
      });

      // Update course stats
      await Course.findByIdAndUpdate(item.course, {
        $inc: { totalStudents: 1, totalRevenue: item.price },
      });

      // Create enrollment
      await Enrollment.create({
        student: order.user,
        course: item.course,
        order: order._id,
      });
    }

    order.platformFee = totalPlatformFee;
    order.instructorEarnings = instructorEarnings;
    await order.save();

    // Update student
    await User.findByIdAndUpdate(order.user, {
      $push: {
        enrolledCourses: { $each: order.items.map(i => i.course) },
      },
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    // Update coupon usage
    if (order.coupon) {
      await Coupon.findByIdAndUpdate(order.coupon, {
        $inc: { usedCount: 1 },
        $push: { usedBy: order.user },
      });
    }

    // Create notification
    await Notification.create({
      user: order.user,
      type: 'enrollment',
      title: 'Enrollment Successful',
      message: `You have been enrolled in ${order.items.length} course(s).`,
      link: '/my-courses',
    });

    await AuditLog.create({
      action: 'order_complete',
      resource: 'order',
      resourceId: order._id,
      user: order.user,
    });
  }

  res.status(200).json({ received: true });
});

// @desc    Get order by session ID
// @route   GET /api/v1/payments/order/:sessionId
export const getOrderBySession = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    'payment.stripeSessionId': req.params.sessionId,
    user: req.user._id,
  })
    .populate('items.course', 'title slug thumbnail')
    .lean();

  if (!order) throw ApiError.notFound('Order not found');

  ApiResponse.success({ order }, 'Order retrieved').send(res);
});

// @desc    Get user's orders
// @route   GET /api/v1/payments/orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.course', 'title slug thumbnail')
    .sort({ createdAt: -1 })
    .lean();

  ApiResponse.success({ orders }, 'Orders retrieved').send(res);
});
