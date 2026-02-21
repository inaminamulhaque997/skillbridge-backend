import { Response } from 'express';
import * as reviewService from '../services/review.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CreateReviewInput } from '../validations/review.validation.js';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const input = req.body as CreateReviewInput;
  const result = await reviewService.createReview(req.user.userId, input);

  res.status(201).json(
    new ApiResponse(201, result, 'Review created successfully')
  );
});

export const getTutorReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tutorId } = req.params;
  const { page = '1', limit = '10' } = req.query;
  const result = await reviewService.getTutorReviews(tutorId, page as string, limit as string);

  res.status(200).json(
    new ApiResponse(200, result, 'Reviews retrieved successfully')
  );
});

export const checkBookingReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.params;
  const result = await reviewService.checkReviewExists(bookingId);

  res.status(200).json(
    new ApiResponse(200, result, 'Review check completed')
  );
});
