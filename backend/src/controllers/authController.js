import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/helpers.js';

const generateTokens = userId => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    }
  );
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const allowedRole = ['student', 'instructor'].includes(role) ? role : 'student';

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: allowedRole,
    emailVerificationToken: generateToken(),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  user.loginCount = 1;
  await user.save();

  await AuditLog.create({
    user: user._id,
    action: 'user_register',
    resource: 'user',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  setCookies(res, accessToken, refreshToken);

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;
  delete userData.emailVerificationToken;

  new ApiResponse(
    201,
    {
      user: userData,
      accessToken,
    },
    'Registration successful'
  ).send(res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account has been deactivated');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save();

  await AuditLog.create({
    user: user._id,
    action: 'user_login',
    resource: 'user',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  setCookies(res, accessToken, refreshToken);

  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  ApiResponse.success(
    {
      user: userData,
      accessToken,
    },
    'Login successful'
  ).send(res);
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  setCookies(res, accessToken, refreshToken);

  ApiResponse.success({ accessToken }, 'Token refreshed').send(res);
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  ApiResponse.success(null, 'Logged out successfully').send(res);
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success({ user: req.user }, 'User profile retrieved').send(res);
});

// @desc    Update profile
// @route   PUT /api/v1/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'firstName',
    'lastName',
    'bio',
    'headline',
    'website',
    'socialLinks',
  ];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success({ user }, 'Profile updated').send(res);
});

// @desc    Change password
// @route   PUT /api/v1/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(null, 'Password changed successfully').send(res);
});

// @desc    Apply to become instructor
// @route   POST /api/v1/auth/apply-instructor
export const applyInstructor = asyncHandler(async (req, res) => {
  const { expertise, bio, headline } = req.body;

  if (req.user.role === 'instructor') {
    throw ApiError.badRequest('You are already an instructor');
  }

  if (req.user.instructorStatus === 'pending') {
    throw ApiError.badRequest('Your instructor application is already pending');
  }

  await User.findByIdAndUpdate(req.user._id, {
    instructorStatus: 'pending',
    instructorAppliedAt: new Date(),
    expertise: expertise || [],
    bio: bio || req.user.bio,
    headline: headline || req.user.headline,
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'instructor_apply',
    resource: 'user',
    resourceId: req.user._id,
  });

  ApiResponse.success(null, 'Instructor application submitted').send(res);
});
