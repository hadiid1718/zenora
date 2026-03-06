import { Router } from 'express';
import {
  createCheckout,
  stripeWebhook,
  getOrderBySession,
  getMyOrders,
} from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';
import { paymentLimiter } from '../middlewares/rateLimiter.js';
import express from 'express';

const router = Router();

// Webhook needs raw body — must be before json parser
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

router.post('/checkout', authenticate, paymentLimiter, createCheckout);
router.get('/order/:sessionId', authenticate, getOrderBySession);
router.get('/orders', authenticate, getMyOrders);

export default router;
