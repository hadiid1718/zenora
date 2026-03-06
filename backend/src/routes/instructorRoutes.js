import { Router } from 'express';
import {
  getDashboard,
  getCourseAnalytics,
  createCoupon,
  getCoupons,
  deleteCoupon,
  requestWithdrawal,
  getWithdrawals,
  replyToReview,
} from '../controllers/instructorController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { couponValidation } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate, authorize('instructor', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/courses/:id/analytics', getCourseAnalytics);
router.get('/coupons', getCoupons);
router.post('/coupons', couponValidation, createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.post('/withdrawals', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.post('/reviews/:id/reply', replyToReview);

export default router;
