import { Response } from 'express';
import * as bookingService from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { CreateBookingInput, UpdateBookingStatusInput, QueryBookingInput } from '../validations/booking.validation.js';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const input = req.body as CreateBookingInput;
  const result = await bookingService.createBooking(req.user.userId, input);

  res.status(201).json(
    new ApiResponse(201, result, 'Booking created successfully')
  );
});

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const query = req.query as unknown as QueryBookingInput;
  const result = await bookingService.getMyBookings(req.user.userId, req.user.role, query);

  res.status(200).json(
    new ApiResponse(200, result, 'Bookings retrieved successfully')
  );
});

export const getBookingById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const { id } = req.params;
  const result = await bookingService.getBookingById(id, req.user.userId, req.user.role);

  res.status(200).json(
    new ApiResponse(200, result, 'Booking retrieved successfully')
  );
});

export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const { id } = req.params;
  const input = req.body as UpdateBookingStatusInput;
  const result = await bookingService.updateBookingStatus(id, req.user.userId, input);

  res.status(200).json(
    new ApiResponse(200, result, 'Booking status updated successfully')
  );
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const { id } = req.params;
  const result = await bookingService.cancelBooking(id, req.user.userId);

  res.status(200).json(
    new ApiResponse(200, result, 'Booking cancelled successfully')
  );
});
