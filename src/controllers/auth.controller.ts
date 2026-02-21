import { Response } from 'express';
import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { RegisterInput, LoginInput } from '../validations/auth.validation.js';

// Cookie options for HTTP-only cookie
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = req.body as RegisterInput;
  const result = await authService.registerUser(input);

  // Set HTTP-only cookie
  res.cookie('skillbridge_token', result.token, COOKIE_OPTIONS);

  res.status(201).json(
    new ApiResponse(201, result, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = req.body as LoginInput;
  const result = await authService.loginUser(input);

  // Set HTTP-only cookie
  res.cookie('skillbridge_token', result.token, COOKIE_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, result, 'Login successful')
  );
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Clear the HTTP-only cookie
  res.clearCookie('skillbridge_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logout successful')
  );
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const user = await authService.getCurrentUser(req.user.userId);

  res.status(200).json(
    new ApiResponse(200, { user }, 'User retrieved successfully')
  );
});
