import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { CreateBookingInput, UpdateBookingStatusInput, QueryBookingInput } from '../validations/booking.validation.js';

export const createBooking = async (studentId: string, input: CreateBookingInput) => {
  const { tutorId, date, startTime, endTime, notes } = input;

  // Check if tutor exists and is active
  const tutor = await prisma.user.findFirst({
    where: { id: tutorId, role: 'TUTOR', isActive: true },
    include: { tutorProfile: true },
  });

  if (!tutor) {
    throw ApiError.notFound('Tutor not found');
  }

  // Check if date is in the future
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    throw ApiError.badRequest('Cannot book for a past date');
  }

  // Check tutor availability
  const dayOfWeek = bookingDate.getDay();
  const availability = await prisma.availability.findFirst({
    where: {
      tutorId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!availability) {
    throw ApiError.badRequest('Tutor is not available on this day');
  }

  // Check if time slot is within availability
  if (startTime < availability.startTime || endTime > availability.endTime) {
    throw ApiError.badRequest('Time slot is outside tutor availability');
  }

  // Check for conflicting bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      tutorId,
      date: bookingDate,
      status: { notIn: ['CANCELLED'] },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    throw ApiError.conflict('Time slot is already booked');
  }

  // Calculate price
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  const duration = endHour - startHour;
  const price = Number(tutor.tutorProfile!.hourlyRate) * duration;

  const booking = await prisma.booking.create({
    data: {
      studentId,
      tutorId,
      date: bookingDate,
      startTime,
      endTime,
      price,
      notes,
      status: 'PENDING',
    },
    include: {
      student: {
        select: { id: true, name: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return booking;
};

export const getMyBookings = async (userId: string, role: string, query: QueryBookingInput) => {
  const { status, page = '1', limit = '10' } = query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = role === 'TUTOR' 
    ? { tutorId: userId }
    : { studentId: userId };

  if (status) {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: { date: 'desc' },
    include: {
      student: {
        select: { id: true, name: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, avatar: true },
      },
      review: {
        select: { id: true },
      },
    },
  });

  const bookingsWithCanReview = bookings.map((booking) => ({
    ...booking,
    canReview: booking.status === 'COMPLETED' && !booking.review && role === 'STUDENT',
  }));

  const total = await prisma.booking.count({ where });

  return {
    bookings: bookingsWithCanReview,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getBookingById = async (bookingId: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: {
        select: { id: true, name: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, avatar: true },
      },
      review: true,
    },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Check if user has access to this booking
  if (role !== 'ADMIN' && booking.studentId !== userId && booking.tutorId !== userId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  const canReview = booking.status === 'COMPLETED' && !booking.review && role === 'STUDENT' && booking.studentId === userId;

  return {
    ...booking,
    canReview,
  };
};

export const updateBookingStatus = async (bookingId: string, userId: string, input: UpdateBookingStatusInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only tutor or admin can update status
  if (booking.tutorId !== userId) {
    throw ApiError.forbidden('Only the tutor can update booking status');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status },
    include: {
      student: {
        select: { id: true, name: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return updatedBooking;
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only student can cancel their own booking
  if (booking.studentId !== userId) {
    throw ApiError.forbidden('You can only cancel your own bookings');
  }

  // Cannot cancel completed bookings
  if (booking.status === 'COMPLETED') {
    throw ApiError.badRequest('Cannot cancel a completed booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
    include: {
      student: {
        select: { id: true, name: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return updatedBooking;
};
