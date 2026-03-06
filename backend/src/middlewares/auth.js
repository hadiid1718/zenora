import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies as fallback
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid access token');
    }
    throw error;
  }
});

// Optional auth — sets req.user if token exists but doesn't require it
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select(
        '-password -refreshToken'
      );
    } catch {
      // Silently continue without user
    }
  }

  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};
