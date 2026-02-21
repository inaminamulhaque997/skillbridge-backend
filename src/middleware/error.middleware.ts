import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

interface ErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else {
    error = ApiError.internal('Internal server error');
  }

  const response: ErrorResponse = {
    success: false,
    message: error.message,
    code: error.code,
  };

  if (error.errors.length > 0) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
