import { validationResult, body, param, query } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);
    throw ApiError.badRequest('Validation failed', extractedErrors);
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 }),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 }),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  validate,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Course validations
export const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 }),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all-levels']),
  validate,
];

// Review validations
export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 2000 }),
  validate,
];

// MongoDB ID validation
export const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  validate,
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

// Coupon validation
export const couponValidation = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Type must be percentage or fixed'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be positive'),
  body('startsAt').isISO8601().withMessage('Valid start date is required'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date is required'),
  validate,
];
