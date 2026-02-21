import { Response } from 'express';
import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { UpdateUserInput, CreateCategoryInput, UpdateCategoryInput, QueryUserInput, QueryBookingAdminInput } from '../validations/admin.validation.js';

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as QueryUserInput;
  const result = await adminService.getAllUsers(query);

  res.status(200).json(
    new ApiResponse(200, result, 'Users retrieved successfully')
  );
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const input = req.body as UpdateUserInput;
  const result = await adminService.updateUser(id, input);

  res.status(200).json(
    new ApiResponse(200, result, 'User updated successfully')
  );
});

export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = req.query as unknown as QueryBookingAdminInput;
  const result = await adminService.getAllBookings(query);

  res.status(200).json(
    new ApiResponse(200, result, 'Bookings retrieved successfully')
  );
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adminService.getStats();

  res.status(200).json(
    new ApiResponse(200, result, 'Stats retrieved successfully')
  );
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = req.body as CreateCategoryInput;
  const result = await adminService.createCategory(input);

  res.status(201).json(
    new ApiResponse(201, result, 'Category created successfully')
  );
});

export const getAllCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adminService.getAllCategories();

  res.status(200).json(
    new ApiResponse(200, result, 'Categories retrieved successfully')
  );
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const input = req.body as UpdateCategoryInput;
  const result = await adminService.updateCategory(id, input);

  res.status(200).json(
    new ApiResponse(200, result, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await adminService.deleteCategory(id);

  res.status(200).json(
    new ApiResponse(200, result, 'Category deleted successfully')
  );
});
