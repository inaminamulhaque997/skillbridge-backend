import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryTutorInput, UpdateTutorProfileInput, UpdateAvailabilityInput } from '../validations/tutor.validation.js';

export const getAllTutors = async (query: QueryTutorInput) => {
  const { subject, minPrice, maxPrice, minRating, page = '1', limit = '10' } = query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    role: 'TUTOR',
    isActive: true,
  };

  if (subject) {
    where.tutorProfile = {
      subjects: {
        has: subject,
      },
    };
  }

  if (minPrice || maxPrice) {
    where.tutorProfile = {
      ...where.tutorProfile,
      hourlyRate: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      },
    };
  }

  const tutors = await prisma.user.findMany({
    where,
    skip,
    take: limitNum,
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      tutorProfile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get average ratings and review counts
  const tutorsWithRatings = await Promise.all(
    tutors.map(async (tutor) => {
      const reviews = await prisma.review.aggregate({
        where: { tutorId: tutor.id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        ...tutor,
        averageRating: reviews._avg.rating || 0,
        totalReviews: reviews._count.rating || 0,
      };
    })
  );

  // Filter by minRating if specified
  let filteredTutors = tutorsWithRatings;
  if (minRating) {
    filteredTutors = tutorsWithRatings.filter(
      (t) => t.averageRating >= parseFloat(minRating)
    );
  }

  const total = await prisma.user.count({ where });

  return {
    tutors: filteredTutors,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getTutorById = async (tutorId: string) => {
  const tutor = await prisma.user.findFirst({
    where: { id: tutorId, role: 'TUTOR', isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      tutorProfile: true,
      availability: true,
    },
  });

  if (!tutor) {
    throw ApiError.notFound('Tutor not found');
  }

  // Get reviews with author info
  const reviews = await prisma.review.findMany({
    where: { tutorId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  // Get average rating
  const reviewStats = await prisma.review.aggregate({
    where: { tutorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    tutor,
    reviews,
    averageRating: reviewStats._avg.rating || 0,
    totalReviews: reviewStats._count.rating || 0,
  };
};

export const getTutorAvailability = async (tutorId: string) => {
  const tutor = await prisma.user.findFirst({
    where: { id: tutorId, role: 'TUTOR', isActive: true },
    include: {
      availability: {
        where: { isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  if (!tutor) {
    throw ApiError.notFound('Tutor not found');
  }

  return tutor.availability;
};

export const getMyTutorProfile = async (userId: string) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
        },
      },
    },
  });

  if (!profile) {
    throw ApiError.notFound('Tutor profile not found');
  }

  return profile;
};

export const updateTutorProfile = async (userId: string, input: UpdateTutorProfileInput) => {
  let profile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    // Create profile if doesn't exist
    profile = await prisma.tutorProfile.create({
      data: {
        userId,
        bio: input.bio || '',
        hourlyRate: input.hourlyRate || 0,
        education: input.education,
        experience: input.experience,
        subjects: input.subjects || [],
        languages: input.languages || ['English'],
      },
    });
  } else {
    // Update existing profile
    profile = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.hourlyRate !== undefined && { hourlyRate: input.hourlyRate }),
        ...(input.education !== undefined && { education: input.education }),
        ...(input.experience !== undefined && { experience: input.experience }),
        ...(input.subjects !== undefined && { subjects: input.subjects }),
        ...(input.languages !== undefined && { languages: input.languages }),
      },
    });
  }

  return profile;
};

export const getMyAvailability = async (userId: string) => {
  const availability = await prisma.availability.findMany({
    where: { tutorId: userId },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  return availability;
};

export const updateMyAvailability = async (userId: string, input: UpdateAvailabilityInput) => {
  // Delete existing availability
  await prisma.availability.deleteMany({
    where: { tutorId: userId },
  });

  // Create new availability
  if (input.availability.length > 0) {
    await prisma.availability.createMany({
      data: input.availability.map((slot) => ({
        tutorId: userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
      })),
    });
  }

  return getMyAvailability(userId);
};

export const getMySessions = async (userId: string, page = '1', limit = '10') => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const sessions = await prisma.booking.findMany({
    where: { tutorId: userId },
    skip,
    take: limitNum,
    orderBy: { date: 'desc' },
    include: {
      student: {
        select: { id: true, name: true, avatar: true, email: true },
      },
      review: true,
    },
  });

  const total = await prisma.booking.count({ where: { tutorId: userId } });

  return {
    sessions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
