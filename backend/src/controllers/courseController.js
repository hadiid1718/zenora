import Course from '../models/Course.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { slugify, buildPaginationMeta } from '../utils/helpers.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../config/cloudinary.js';
import { PAGINATION, COURSE_STATUS } from '../utils/constants.js';

// @desc    Create course
// @route   POST /api/v1/courses
export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    price,
    level,
    language,
    subtitle,
    learningOutcomes,
    requirements,
    targetAudience,
    tags,
    thumbnail,
    promoVideo,
  } = req.body;

  const slug = slugify(title) + '-' + Date.now().toString(36);

  const courseData = {
    title,
    slug,
    subtitle,
    description,
    instructor: req.user._id,
    category,
    price: parseFloat(price),
    level,
    language,
    learningOutcomes: learningOutcomes || [],
    requirements: requirements || [],
    targetAudience: targetAudience || [],
    tags: tags || [],
    isFree: parseFloat(price) === 0,
  };

  if (thumbnail) {
    courseData.thumbnail = { url: thumbnail, publicId: '' };
  }
  if (promoVideo) {
    courseData.promoVideo = { url: promoVideo, publicId: '' };
  }

  const course = await Course.create(courseData);

  await cacheDel('courses:*');

  new ApiResponse(201, { course }, 'Course created successfully').send(res);
});

// @desc    Get all published courses (public)
// @route   GET /api/v1/courses
export const getCourses = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search,
    category,
    level,
    price,
    sort,
    rating,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

  const cacheKey = `courses:${JSON.stringify(req.query)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return ApiResponse.success(cached, 'Courses retrieved (cached)').send(res);
  }

  const filter = { status: COURSE_STATUS.PUBLISHED };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }
  if (level) {
    filter.level = level;
  }
  if (rating) {
    filter.averageRating = { $gte: parseFloat(rating) };
  }
  if (price === 'free') {
    filter.isFree = true;
  } else if (price === 'paid') {
    filter.isFree = false;
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'popular') sortOption = { totalStudents: -1 };
  if (sort === 'rating') sortOption = { averageRating: -1 };
  if (sort === 'price-low') sortOption = { price: 1 };
  if (sort === 'price-high') sortOption = { price: -1 };
  if (sort === 'newest') sortOption = { publishedAt: -1 };

  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .populate('instructor', 'firstName lastName avatar headline')
    .populate('category', 'name slug')
    .select('-modules')
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const result = {
    courses,
    pagination: buildPaginationMeta(total, pageNum, limitNum),
  };

  await cacheSet(cacheKey, result, 300); // 5 min cache

  ApiResponse.success(result, 'Courses retrieved').send(res);
});

// @desc    Get single course by slug (public)
// @route   GET /api/v1/courses/slug/:slug
export const getCourseBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const cacheKey = `course:${slug}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return ApiResponse.success(cached, 'Course retrieved (cached)').send(res);
  }

  const course = await Course.findOne({
    slug,
    status: { $in: [COURSE_STATUS.PUBLISHED, COURSE_STATUS.APPROVED] },
  })
    .populate(
      'instructor',
      'firstName lastName avatar headline bio totalStudents totalCourses'
    )
    .populate('category', 'name slug')
    .lean();

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Don't expose video URLs for non-preview lessons
  if (course.modules) {
    course.modules = course.modules.map(mod => ({
      ...mod,
      lessons: mod.lessons.map(lesson => ({
        ...lesson,
        video: lesson.isPreview
          ? lesson.video
          : { duration: lesson.video?.duration || 0 },
      })),
    }));
  }

  await cacheSet(cacheKey, course, 600); // 10 min cache

  ApiResponse.success({ course }, 'Course retrieved').send(res);
});

// @desc    Get course by ID (for instructor)
// @route   GET /api/v1/courses/:id
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'firstName lastName avatar')
    .populate('category', 'name slug');

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Only instructor or admin can view non-published courses
  if (
    course.instructor._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    if (course.status !== COURSE_STATUS.PUBLISHED) {
      throw ApiError.forbidden('Not authorized');
    }
  }

  ApiResponse.success({ course }, 'Course retrieved').send(res);
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized');
  }

  const allowedUpdates = [
    'title',
    'subtitle',
    'description',
    'price',
    'level',
    'language',
    'learningOutcomes',
    'requirements',
    'targetAudience',
    'tags',
    'metaTitle',
    'metaDescription',
  ];

  const updates = {};
  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.title) {
    updates.slug = slugify(updates.title) + '-' + Date.now().toString(36);
  }

  if (updates.price !== undefined) {
    updates.isFree = parseFloat(updates.price) === 0;
  }

  course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  await cacheDel('courses:*');
  await cacheDel(`course:${course.slug}`);

  ApiResponse.success({ course }, 'Course updated').send(res);
});

// @desc    Upload course thumbnail
// @route   PUT /api/v1/courses/:id/thumbnail
export const uploadThumbnail = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.instructor.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not authorized');

  if (!req.file) throw ApiError.badRequest('Image file is required');

  if (course.thumbnail?.publicId) {
    await deleteFromCloudinary(course.thumbnail.publicId);
  }

  const result = await uploadToCloudinary(req.file.path, 'courses/thumbnails');
  course.thumbnail = { url: result.url, publicId: result.publicId };
  await course.save();

  await cacheDel(`course:${course.slug}`);

  ApiResponse.success(
    { thumbnail: course.thumbnail },
    'Thumbnail uploaded'
  ).send(res);
});

// @desc    Add module to course
// @route   POST /api/v1/courses/:id/modules
export const addModule = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.instructor.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not authorized');

  const { title, description } = req.body;
  course.modules.push({
    title,
    description,
    sortOrder: course.modules.length,
    lessons: [],
  });

  await course.save();
  await cacheDel(`course:${course.slug}`);

  ApiResponse.success({ course }, 'Module added').send(res);
});

// @desc    Add lesson to module
// @route   POST /api/v1/courses/:id/modules/:moduleId/lessons
export const addLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.instructor.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not authorized');

  const module = course.modules.id(req.params.moduleId);
  if (!module) throw ApiError.notFound('Module not found');

  const { title, type, description, isPreview, duration, article } = req.body;
  module.lessons.push({
    title,
    type,
    description,
    isPreview: isPreview || false,
    duration: duration || 0,
    sortOrder: module.lessons.length,
    article: article || {},
  });

  await course.save();
  await cacheDel(`course:${course.slug}`);

  ApiResponse.success({ course }, 'Lesson added').send(res);
});

// @desc    Submit course for review
// @route   PUT /api/v1/courses/:id/submit
export const submitForReview = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.instructor.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not authorized');

  if (course.modules.length === 0) {
    throw ApiError.badRequest('Course must have at least one module');
  }

  const hasLessons = course.modules.some(m => m.lessons.length > 0);
  if (!hasLessons) {
    throw ApiError.badRequest('Course must have at least one lesson');
  }

  course.status = COURSE_STATUS.PENDING;
  await course.save();

  await cacheDel('courses:*');

  ApiResponse.success({ course }, 'Course submitted for review').send(res);
});

// @desc    Get instructor's courses
// @route   GET /api/v1/courses/instructor/my-courses
export const getInstructorCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = { instructor: req.user._id };
  if (status) filter.status = status;

  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  ApiResponse.success(
    {
      courses,
      pagination: buildPaginationMeta(total, pageNum, limitNum),
    },
    'Instructor courses retrieved'
  ).send(res);
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  if (
    course.instructor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized');
  }

  if (course.totalStudents > 0) {
    throw ApiError.badRequest('Cannot delete a course with enrolled students');
  }

  if (course.thumbnail?.publicId) {
    await deleteFromCloudinary(course.thumbnail.publicId);
  }

  await Course.findByIdAndDelete(req.params.id);
  await cacheDel('courses:*');

  ApiResponse.success(null, 'Course deleted').send(res);
});

// @desc    Get featured courses
// @route   GET /api/v1/courses/featured
export const getFeaturedCourses = asyncHandler(async (req, res) => {
  const cached = await cacheGet('courses:featured');
  if (cached) {
    return ApiResponse.success(cached, 'Featured courses (cached)').send(res);
  }

  const courses = await Course.find({
    status: COURSE_STATUS.PUBLISHED,
    isFeatured: true,
  })
    .populate('instructor', 'firstName lastName avatar')
    .populate('category', 'name slug')
    .select('-modules')
    .sort({ averageRating: -1 })
    .limit(8)
    .lean();

  await cacheSet('courses:featured', courses, 600);

  ApiResponse.success({ courses }, 'Featured courses retrieved').send(res);
});

// @desc    Get categories
// @route   GET /api/v1/courses/categories
export const getCategories = asyncHandler(async (req, res) => {
  const cached = await cacheGet('categories:all');
  if (cached) {
    return ApiResponse.success(cached, 'Categories (cached)').send(res);
  }

  const categories = await Category.find({ isActive: true, parent: null })
    .populate('subcategories')
    .sort({ sortOrder: 1 })
    .lean();

  await cacheSet('categories:all', categories, 3600);

  ApiResponse.success({ categories }, 'Categories retrieved').send(res);
});
