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
  'https://skillbridge-frontend-mocha.vercel.app',
  'https://skillbridge-frontend-git-main-inam-s-projects.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// CORS configuration that allows all Vercel preview deployments
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Allow localhost
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
      return;
    }
    
    // Allow all Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }
    
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Reject others
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
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
