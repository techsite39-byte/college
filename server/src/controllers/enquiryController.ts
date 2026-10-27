import type { Request, Response } from 'express';
import { createTransport } from 'nodemailer';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Enquiry } from '../models/Enquiry.js';
import { AppError } from '../utils/appError.js';

const enquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(20),
  subject: z.string().trim().max(120).optional().default(''),
  courseInterest: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(1200).optional().default(''),
  consent: z.literal(true),
});

const enquiryUpdateSchema = z.object({
  status: z.enum(['new', 'reviewed', 'contacted', 'closed']).optional(),
  internalNotes: z.string().trim().max(3000).optional(),
}).refine((value) => value.status !== undefined || value.internalNotes !== undefined, 'No enquiry changes provided');

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export async function createEnquiry(req: Request, res: Response) {
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    throw new AppError('Unable to process this enquiry', 400);
  }

  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Please provide valid enquiry details and consent to be contacted', 400);
  }

  const enquiry = await Enquiry.create({
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    notificationStatus: 'pending',
  });
  const recipient = env.notificationEmail || env.adminEmail;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !recipient) {
    enquiry.notificationStatus = 'not_configured';
    await enquiry.save();
    res.status(201).json({ success: true, data: { id: String(enquiry._id) } });
    return;
  }

  try {
    const transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
    await transporter.sendMail({
      from: env.smtpFrom,
      to: recipient,
      subject: `New college enquiry: ${parsed.data.fullName}`,
      text: [
        `Name: ${parsed.data.fullName}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${parsed.data.phone}`,
        ...(parsed.data.subject ? [`Subject: ${parsed.data.subject}`] : []),
        ...(parsed.data.courseInterest ? [`Course interest: ${parsed.data.courseInterest}`] : []),
        '',
        parsed.data.message || 'No additional message.',
      ].join('\n'),
    });
    enquiry.notificationStatus = 'sent';
  } catch (error) {
    console.error('Enquiry notification delivery failed', error);
    enquiry.notificationStatus = 'failed';
  }

  await enquiry.save();
  res.status(201).json({ success: true, data: { id: String(enquiry._id) } });
}

export async function listEnquiries(req: Request, res: Response) {
  const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || '20'), 10) || 20));
  const filter: Record<string, string> = {};
  if (typeof req.query.status === 'string' && z.enum(['new', 'reviewed', 'contacted', 'closed']).safeParse(req.query.status).success) {
    filter.status = req.query.status;
  }
  if (typeof req.query.courseInterest === 'string' && req.query.courseInterest.trim()) {
    filter.courseInterest = req.query.courseInterest.trim().slice(0, 120);
  }
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const search = req.query.q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    (filter as Record<string, unknown>).$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Enquiry.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function updateEnquiryStatus(req: Request, res: Response) {
  if (!mongoIdSchema.safeParse(req.params.id).success) throw new AppError('Invalid enquiry id', 400);
  const parsed = enquiryUpdateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid enquiry status', 400);

  const updated = await Enquiry.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!updated) throw new AppError('Enquiry not found', 404);
  res.json({ success: true, data: updated });
}

export async function deleteEnquiry(req: Request, res: Response) {
  if (!mongoIdSchema.safeParse(req.params.id).success) throw new AppError('Invalid enquiry id', 400);
  const deleted = await Enquiry.findByIdAndDelete(req.params.id);
  if (!deleted) throw new AppError('Enquiry not found', 404);
  res.json({ success: true, message: 'Enquiry deleted' });
}
