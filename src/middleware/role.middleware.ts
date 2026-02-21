import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { ApiError } from '../utils/ApiError.js';

type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!roles.includes(req.user.role as Role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  };
};
