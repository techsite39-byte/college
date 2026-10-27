import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

export function requireSameOrigin(req: Request, _res: Response, next: NextFunction) {
  const origin = req.get('origin');
  if (!origin) return next();

  let normalizedOrigin: string;
  try {
    normalizedOrigin = new URL(origin).origin;
  } catch {
    return next(new AppError('Invalid request origin', 403));
  }

  if (!env.clientOrigins.includes(normalizedOrigin)) {
    return next(new AppError('Request origin is not allowed', 403));
  }

  return next();
}
