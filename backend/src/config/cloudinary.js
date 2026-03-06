import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary configured');
};

export const uploadToCloudinary = async (
  filePath,
  folder,
  resourceType = 'auto'
) => {
  const options = {
    folder: `zenora/${folder}`,
    resource_type: resourceType,
  };

  if (resourceType !== 'video') {
    options.quality = 'auto';
    options.fetch_format = 'auto';
  }

  const result = await cloudinary.uploader.upload(filePath, options);
  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    size: result.bytes,
    duration: result.duration || null,
  };
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = 'image'
) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
export default configureCloudinary;
