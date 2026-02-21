import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken, JWTPayload } from '../config/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { RegisterInput, LoginInput } from '../validations/auth.validation.js';

export const registerUser = async (input: RegisterInput) => {
  const { email, password, name, role } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered', [
      { field: 'email', message: 'Email already exists' },
    ]);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const tokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);

  return { user, token };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('User account is deactivated');
  }

  const tokenPayload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);

  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userWithoutPassword, token };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      tutorProfile: true,
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};
