import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import tutorRoutes from './routes/tutor.routes.js';
import tutorManagementRoutes from './routes/tutorManagement.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/category.routes.js';

dotenv.config();

const app: Express = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001',
  'https://skillbridge-frontend-mocha.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - API info
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SkillBridge API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tutors: '/api/tutors',
      categories: '/api/categories',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      admin: '/api/admin',
      tutor: '/api/tutor'
    }
  });
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/tutor', tutorManagementRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
