import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError.js';

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return next(new AppError('Forbidden', 403));
    }

    next();
    return undefined;
  };
}
