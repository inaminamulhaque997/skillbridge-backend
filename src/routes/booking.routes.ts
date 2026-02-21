import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { createBookingSchema, updateBookingStatusSchema } from '../validations/booking.validation.js';

const router = Router();

// All booking routes are protected
router.use(authenticate);

// Student routes
router.post('/', authorize('STUDENT'), validate(createBookingSchema), bookingController.createBooking);
router.get('/', authorize('STUDENT', 'TUTOR', 'ADMIN'), bookingController.getMyBookings);
router.get('/:id', authorize('STUDENT', 'TUTOR', 'ADMIN'), bookingController.getBookingById);
router.patch('/:id/cancel', authorize('STUDENT'), bookingController.cancelBooking);

// Tutor/Admin routes
router.patch('/:id/status', authorize('TUTOR', 'ADMIN'), validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

export default router;
