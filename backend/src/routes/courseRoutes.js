import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseBySlug,
  getCourseById,
  updateCourse,
  uploadThumbnail,
  addModule,
  addLesson,
  submitForReview,
  getInstructorCourses,
  deleteCourse,
  getFeaturedCourses,
  getCategories,
} from '../controllers/courseController.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';
import { createCourseValidation } from '../middlewares/validate.js';
import { uploadImage } from '../middlewares/upload.js';
import { apiLimiter, uploadLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes
router.get('/', apiLimiter, getCourses);
router.get('/featured', apiLimiter, getFeaturedCourses);
router.get('/categories', apiLimiter, getCategories);
router.get('/slug/:slug', apiLimiter, optionalAuth, getCourseBySlug);

// Instructor routes
router.get(
  '/instructor/my-courses',
  authenticate,
  authorize('instructor', 'admin'),
  getInstructorCourses
);
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  createCourseValidation,
  createCourse
);
router.get('/:id', authenticate, getCourseById);
router.put(
  '/:id',
  authenticate,
  authorize('instructor', 'admin'),
  updateCourse
);
router.delete(
  '/:id',
  authenticate,
  authorize('instructor', 'admin'),
  deleteCourse
);
router.put(
  '/:id/thumbnail',
  authenticate,
  authorize('instructor', 'admin'),
  uploadLimiter,
  uploadImage.single('thumbnail'),
  uploadThumbnail
);
router.post(
  '/:id/modules',
  authenticate,
  authorize('instructor', 'admin'),
  addModule
);
router.post(
  '/:id/modules/:moduleId/lessons',
  authenticate,
  authorize('instructor', 'admin'),
  addLesson
);
router.put(
  '/:id/submit',
  authenticate,
  authorize('instructor', 'admin'),
  submitForReview
);

export default router;
