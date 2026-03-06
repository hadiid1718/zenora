import Redis from 'ioredis';
import logger from './logger.js';

let redis = null;

const connectRedis = () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', err =>
      logger.warn('Redis error (non-fatal):', err.message)
    );
    redis.on('close', () => logger.warn('Redis connection closed'));

    redis.connect().catch(err => {
      logger.warn(
        'Redis connection failed (running without cache):',
        err.message
      );
    });
  } catch (err) {
    logger.warn(
      'Redis initialization failed (running without cache):',
      err.message
    );
  }

  return redis;
};

export const getRedis = () => redis;

export const cacheGet = async key => {
  if (!redis || redis.status !== 'ready') return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (key, value, ttl = 3600) => {
  if (!redis || redis.status !== 'ready') return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Non-fatal
  }
};

export const cacheDel = async pattern => {
  if (!redis || redis.status !== 'ready') return;
  try {
    if (pattern.includes('*')) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(...keys);
    } else {
      await redis.del(pattern);
    }
  } catch {
    // Non-fatal
  }
};

export default connectRedis;
