import crypto from 'crypto';

export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const generateCertificateNumber = () => {
  const prefix = 'ZEN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const calculateRevenueSplit = (amount, platformFeePercentage) => {
  const platformFee =
    Math.round(((amount * platformFeePercentage) / 100) * 100) / 100;
  const instructorEarning = Math.round((amount - platformFee) * 100) / 100;
  return { platformFee, instructorEarning };
};

export const paginateQuery = (query, page, limit) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
