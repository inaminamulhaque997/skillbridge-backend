import { z } from 'zod';

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['STUDENT', 'TUTOR', 'ADMIN']).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const queryUserSchema = z.object({
  role: z.enum(['STUDENT', 'TUTOR', 'ADMIN']).optional(),
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const queryBookingAdminSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  tutorId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type QueryUserInput = z.infer<typeof queryUserSchema>;
export type QueryBookingAdminInput = z.infer<typeof queryBookingAdminSchema>;
