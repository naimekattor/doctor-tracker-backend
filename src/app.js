import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { nosqlSanitizer } from './middleware/sanitizeMiddleware.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';

const app = express();

// Trust reverse proxy (Cloudflare, Render, ALB) for accurate IP resolution in rate limiting
app.set('trust proxy', 1);

// Request Correlation ID Middleware
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(cors());

// Payload size limit to prevent body-parser Denial-of-Service attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NoSQL Operator & Key Injection Defense
app.use(nosqlSanitizer);

// API Health & Readiness Check (Exempt from user rate limiting for infra probes)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    message: isHealthy ? 'Doctor Tracker API is operational' : 'Database connection unavailable',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
    },
  });
});

// Global Baseline Rate Limiter (Applied to all API routes below)
app.use(globalLimiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;