import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: 'Invalid content data' });
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with that unique value already exists' });
  }

  if (error instanceof Error) {
    console.error('Request failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }

  console.error('Request failed with a non-error value:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
