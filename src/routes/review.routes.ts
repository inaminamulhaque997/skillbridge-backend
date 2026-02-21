import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { createReviewSchema } from '../validations/review.validation.js';

const router = Router();

// Public routes (no auth required)
router.get('/tutor/:tutorId', reviewController.getTutorReviews);

// Protected routes
router.use(authenticate);

// Check if booking has been reviewed (student only)
router.get('/booking/:bookingId', authorize('STUDENT'), reviewController.checkBookingReview);

// Create review (student only)
router.post('/', authorize('STUDENT'), validate(createReviewSchema), reviewController.createReview);

export default router;
