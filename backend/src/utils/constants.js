export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const INSTRUCTOR_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const PLATFORM_FEE_PERCENTAGE =
  parseInt(process.env.PLATFORM_FEE_PERCENTAGE) || 30;
export const MIN_WITHDRAWAL_AMOUNT =
  parseInt(process.env.MIN_WITHDRAWAL_AMOUNT) || 50;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
