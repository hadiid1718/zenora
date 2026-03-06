import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import configureCloudinary from './config/cloudinary.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (non-blocking)
    connectRedis();

    // Configure Cloudinary
    configureCloudinary();

    // Create temp upload directory
    const fs = await import('fs');
    const tmpDir = '/tmp/zenora-uploads';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    app.listen(PORT, () => {
      logger.info(`Zenora API server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', err => {
  logger.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
