import { Response } from 'express';
import * as tutorService from '../services/tutor.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { UpdateTutorProfileInput, UpdateAvailabilityInput, QueryTutorInput } from '../validations/tutor.validation.js';

export const getAllTutors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as QueryTutorInput;
  const result = await tutorService.getAllTutors(query);

  res.status(200).json(
    new ApiResponse(200, result, 'Tutors retrieved successfully')
  );
});

export const getTutorById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await tutorService.getTutorById(id);

  res.status(200).json(
    new ApiResponse(200, result, 'Tutor retrieved successfully')
  );
});

export const getTutorAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await tutorService.getTutorAvailability(id);

  res.status(200).json(
    new ApiResponse(200, result, 'Availability retrieved successfully')
  );
});

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const result = await tutorService.getMyTutorProfile(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, result, 'Profile retrieved successfully')
  );
});

export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const input = req.body as UpdateTutorProfileInput;
  const result = await tutorService.updateTutorProfile(req.user.userId, input);

  res.status(200).json(
    new ApiResponse(200, result, 'Profile updated successfully')
  );
});

export const getMyAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const result = await tutorService.getMyAvailability(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, result, 'Availability retrieved successfully')
  );
});

export const updateMyAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const input = req.body as UpdateAvailabilityInput;
  const result = await tutorService.updateMyAvailability(req.user.userId, input);

  res.status(200).json(
    new ApiResponse(200, result, 'Availability updated successfully')
  );
});

export const getMySessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const { page = '1', limit = '10' } = req.query;
  const result = await tutorService.getMySessions(req.user.userId, page as string, limit as string);

  res.status(200).json(
    new ApiResponse(200, result, 'Sessions retrieved successfully')
  );
});
