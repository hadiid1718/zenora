import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import ApiError from './utils/ApiError.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing (skip for webhook route which needs raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next();
  } else {
    express.json({ limit: '100mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// Logging
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Zenora API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/instructor', instructorRoutes);

// 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

export default app;
