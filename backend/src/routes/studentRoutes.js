import { Router } from 'express';
import {
  getEnrolledCourses,
  getCourseContent,
  completeLesson,
  addToCart,
  getCart,
  removeFromCart,
  toggleWishlist,
  getWishlist,
  createReview,
  getCourseReviews,
  getCertificates,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/studentController.js';
import { authenticate } from '../middlewares/auth.js';
import { reviewValidation } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate);

// Courses
router.get('/courses', getEnrolledCourses);
router.get('/courses/:courseId', getCourseContent);
router.post('/courses/:courseId/lessons/:lessonId/complete', completeLesson);

// Cart
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:courseId', removeFromCart);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:courseId', toggleWishlist);

// Reviews
router.post('/reviews/:courseId', reviewValidation, createReview);
router.get('/reviews/:courseId', getCourseReviews);

// Certificates
router.get('/certificates', getCertificates);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
