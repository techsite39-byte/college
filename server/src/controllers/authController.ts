import type { Request, Response } from 'express';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { AppError } from '../utils/appError.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { env } from '../config/env.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid login payload', 400);
  }

  const { email, password } = parsed.data;
  const user = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await comparePassword(password, String(user.passwordHash));
  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: String(user._id), email: String(user.email), role: String(user.role) });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: env.nodeEnv === 'production' ? 'none' : 'strict',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api',
  });

  res.json({ success: true, data: { user: { id: String(user._id), email: String(user.email), name: String(user.name), role: String(user.role) } } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: env.nodeEnv === 'production' ? 'none' : 'strict',
    secure: env.nodeEnv === 'production',
    path: '/api',
  });
  res.json({ success: true, message: 'Logged out' });
}

export async function getCurrentUser(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new AppError('Not authenticated', 401);
  }

  const found = await AdminUser.findById(user.id);
  res.json({
    success: true,
    data: found ? { id: String(found._id), name: String(found.name), email: String(found.email), role: String(found.role) } : null,
  });
}

export async function seedAdmin() {
  if (!env.adminEmail && !env.adminPassword) {
    console.warn('Initial administrator is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
    return;
  }
  if (!env.adminEmail || !env.adminPassword || env.adminPassword.length < 12) {
    throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD; the initial password must be at least 12 characters.');
  }

  const email = z.string().email().safeParse(env.adminEmail);
  if (!email.success) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }

  const normalizedEmail = email.data.toLowerCase();
  const existing = await AdminUser.findOne({ email: normalizedEmail });
  if (existing) return;

  await AdminUser.create({
    name: 'Administrator',
    email: normalizedEmail,
    passwordHash: await hashPassword(env.adminPassword),
    role: 'superadmin',
  });
}
