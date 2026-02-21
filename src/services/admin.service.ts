import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { UpdateUserInput, CreateCategoryInput, UpdateCategoryInput, QueryUserInput, QueryBookingAdminInput } from '../validations/admin.validation.js';

export const getAllUsers = async (query: QueryUserInput) => {
  const { role, isActive, page = '1', limit = '10' } = query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({ where });

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const updateUser = async (userId: string, input: UpdateUserInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.role !== undefined && { role: input.role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const getAllBookings = async (query: QueryBookingAdminInput) => {
  const { status, tutorId, studentId, page = '1', limit = '10' } = query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (tutorId) {
    where.tutorId = tutorId;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  const bookings = await prisma.booking.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      tutor: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });

  const total = await prisma.booking.count({ where });

  return {
    bookings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getStats = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTutors,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TUTOR' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
  ]);

  // Calculate total revenue from completed bookings
  const revenueResult = await prisma.booking.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { price: true },
  });

  return {
    totalUsers,
    totalStudents,
    totalTutors,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue: revenueResult._sum.price || 0,
  };
};

export const createCategory = async (input: CreateCategoryInput) => {
  const { name, description, icon } = input;

  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw ApiError.conflict('Category already exists', [
      { field: 'name', message: 'Category name already exists' },
    ]);
  }

  const category = await prisma.category.create({
    data: { name, description, icon },
  });

  return category;
};

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return categories;
};

export const updateCategory = async (categoryId: string, input: UpdateCategoryInput) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  // Check if new name already exists (if name is being changed)
  if (input.name && input.name !== category.name) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: input.name },
    });

    if (existingCategory) {
      throw ApiError.conflict('Category name already exists', [
        { field: 'name', message: 'Category name already exists' },
      ]);
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.icon !== undefined && { icon: input.icon }),
    },
  });

  return updatedCategory;
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: 'Category deleted successfully' };
};
