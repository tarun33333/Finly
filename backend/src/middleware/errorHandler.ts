import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';
import multer from 'multer';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  logger.error({ err, path: req.originalUrl, method: req.method }, 'Request error occurred');

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation error occurred', 422, 'VALIDATION_ERROR', formatted);
    return;
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds maximum allowed limit (8 MB)', 413, 'FILE_TOO_LARGE');
      return;
    }
    sendError(res, err.message, 400, 'UPLOAD_ERROR');
    return;
  }

  // Handle AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid format for field: ${err.path}`, 400, 'INVALID_ID');
    return;
  }

  // Handle Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `A record with this ${field} already exists`, 409, 'DUPLICATE_KEY');
    return;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Authentication token has expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  // Default fallback for unhandled internal server errors
  sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message || 'Internal Server Error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
};

