import { z } from 'zod';

export const updateTutorProfileSchema = z.object({
  bio: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export const updateAvailabilitySchema = z.object({
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  })),
});

export const queryTutorSchema = z.object({
  subject: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minRating: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UpdateTutorProfileInput = z.infer<typeof updateTutorProfileSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type QueryTutorInput = z.infer<typeof queryTutorSchema>;
