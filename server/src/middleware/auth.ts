import type { RequestHandler } from 'express';
import { AdminUser } from '../models/AdminUser.js';
import { AppError } from '../utils/appError.js';
import { verifyToken } from '../utils/auth.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = req.headers.cookie
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='))
    ?.slice('token='.length);
  const token = cookieToken || bearerToken;

  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch {
    next(new AppError('Invalid or expired authentication token', 401));
    return;
  }

  void AdminUser.findById(payload.id)
    .then((user) => {
      if (!user || !user.isActive) {
        next(new AppError('Invalid or inactive account', 401));
        return;
      }

      req.user = {
        id: String(user._id),
        email: String(user.email),
        role: String(user.role),
      };
      next();
    })
    .catch(next);
};
