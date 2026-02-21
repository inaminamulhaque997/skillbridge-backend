export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: Array<{ field: string; message: string }>;
  public code: string;

  constructor(
    statusCode: number,
    message: string,
    errors: Array<{ field: string; message: string }> = [],
    code: string = 'ERROR'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: Array<{ field: string; message: string }> = []) {
    return new ApiError(400, message, errors, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message, [], 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message, [], 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message, [], 'NOT_FOUND');
  }

  static conflict(message: string, errors: Array<{ field: string; message: string }> = []) {
    return new ApiError(409, message, errors, 'CONFLICT');
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, [], 'INTERNAL_ERROR');
  }
}
