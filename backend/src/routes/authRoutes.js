import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  applyInstructor,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import {
  registerValidation,
  loginValidation,
} from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.post('/apply-instructor', authenticate, applyInstructor);

export default router;
