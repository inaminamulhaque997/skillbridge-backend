import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/auth.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/database.js';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token: string | undefined;

    // Check cookies first
    if (req.cookies && req.cookies.skillbridge_token) {
      token = req.cookies.skillbridge_token;
    }
    // Fall back to Authorization header
    else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account is deactivated');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid token'));
    }
  }
};
