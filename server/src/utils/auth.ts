import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './appError.js';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  const payload = jwt.verify(token, env.jwtSecret);
  if (
    typeof payload === 'string'
    || typeof payload.id !== 'string'
    || typeof payload.email !== 'string'
    || typeof payload.role !== 'string'
  ) {
    throw new AppError('Invalid authentication token', 401);
  }
  return { id: payload.id, email: payload.email, role: payload.role };
}
