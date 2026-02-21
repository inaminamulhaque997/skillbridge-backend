import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { CreateReviewInput } from '../validations/review.validation.js';

export const createReview = async (studentId: string, input: CreateReviewInput) => {
  const { bookingId, rating, comment } = input;

  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check if the student is the one who made the booking
  if (booking.studentId !== studentId) {
    throw ApiError.forbidden('You can only review your own bookings');
  }

  // Check if booking is completed
  if (booking.status !== 'COMPLETED') {
    throw ApiError.badRequest('Can only review completed bookings');
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    throw ApiError.conflict('Review already exists for this booking');
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      studentId,
      tutorId: booking.tutorId,
      rating,
      comment,
    },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
      booking: {
        select: { date: true, startTime: true, endTime: true },
      },
    },
  });

  return review;
};

export const getTutorReviews = async (tutorId: string, page = '1', limit = '10') => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const reviews = await prisma.review.findMany({
    where: { tutorId },
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
    },
  });

  const total = await prisma.review.count({ where: { tutorId } });

  return {
    reviews,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const checkReviewExists = async (bookingId: string) => {
  const review = await prisma.review.findUnique({
    where: { bookingId },
    select: { id: true },
  });

  return { exists: !!review };
};
