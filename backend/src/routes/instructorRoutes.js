import { Router } from 'express';
import {
  getDashboard,
  getCourseAnalytics,
  getAnalytics,
  createCoupon,
  getCoupons,
  deleteCoupon,
  requestWithdrawal,
  getWithdrawals,
  replyToReview,
  updateAvatar,
} from '../controllers/instructorController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { couponValidation } from '../middlewares/validate.js';
import { uploadImage } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate, authorize('instructor', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/courses/:id/analytics', getCourseAnalytics);
router.get('/coupons', getCoupons);
router.post('/coupons', couponValidation, createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.post('/withdrawals', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.post('/reviews/:id/reply', replyToReview);
router.put('/settings/avatar', uploadImage.single('avatar'), updateAvatar);

export default router;
