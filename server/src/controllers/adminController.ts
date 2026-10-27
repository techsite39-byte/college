import type { Request, Response } from 'express';
import type { Model } from 'mongoose';
import { z } from 'zod';
import { Achievement } from '../models/Achievement.js';
import { Course } from '../models/Course.js';
import { Event } from '../models/Event.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { Notice } from '../models/Notice.js';
import { PageContent } from '../models/PageContent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AppError } from '../utils/appError.js';

const status = z.enum(['draft', 'published', 'archived']);
const httpsUrl = z.string().url().refine((value) => /^https?:\/\//i.test(value), 'URL must use HTTP or HTTPS');
const optionalUrl = httpsUrl.or(z.literal('')).optional();
const resourceSchemas = {
  courses: z.object({
    title: z.string().trim().min(1).max(160),
    slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    shortDescription: z.string().trim().min(1).max(500),
    fullDescription: z.string().trim().min(1).max(10000),
    eligibility: z.string().max(1000).optional(),
    duration: z.string().max(120).optional(),
    intake: z.string().max(300).optional(),
    fees: z.string().max(300).optional(),
    image: optionalUrl,
    documents: z.array(httpsUrl).max(20).optional(),
    status,
    seo: z.object({ title: z.string().max(180).optional(), description: z.string().max(320).optional(), keywords: z.array(z.string().max(80)).max(20).optional() }).optional(),
  }).strict(),
  notices: z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    content: z.string().trim().min(1).max(20000),
    category: z.string().max(100).optional(),
    attachment: optionalUrl,
    publishedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    isPinned: z.boolean().optional(),
    status,
  }).strict(),
  events: z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(1).max(12000),
    coverImage: optionalUrl,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    venue: z.string().max(300).optional(),
    status,
  }).strict(),
  gallery: z.object({
    title: z.string().trim().min(1).max(160),
    imageUrl: httpsUrl,
    altText: z.string().trim().max(300).optional(),
    category: z.string().max(100).optional(),
    caption: z.string().max(800).optional(),
    sortOrder: z.number().int().min(0).max(100000).optional(),
    status,
  }).strict(),
  achievements: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(12000),
    category: z.string().max(100).optional(),
    achievementDate: z.coerce.date(),
    image: optionalUrl,
    attachment: optionalUrl,
    status,
  }).strict(),
  pages: z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    sections: z.array(z.record(z.unknown())).max(100),
    seo: z.object({ title: z.string().max(180).optional(), description: z.string().max(320).optional(), keywords: z.array(z.string().max(80)).max(20).optional() }).optional(),
    status,
  }).strict(),
} as const;

type ResourceName = keyof typeof resourceSchemas | 'site-settings';

const models: Record<Exclude<ResourceName, 'site-settings'>, Model<Record<string, unknown>>> = {
  courses: Course as unknown as Model<Record<string, unknown>>,
  notices: Notice as unknown as Model<Record<string, unknown>>,
  events: Event as unknown as Model<Record<string, unknown>>,
  gallery: GalleryImage as unknown as Model<Record<string, unknown>>,
  achievements: Achievement as unknown as Model<Record<string, unknown>>,
  pages: PageContent as unknown as Model<Record<string, unknown>>,
};

const settingsSchema = z.object({
  institutionName: z.string().trim().min(1).max(200).optional(),
  logo: optionalUrl,
  contactDetails: z.object({ phone: z.string().max(50).optional(), email: z.string().email().or(z.literal('')).optional(), website: optionalUrl }).partial().optional(),
  address: z.string().max(1000).optional(),
  socialLinks: z.object({ facebook: optionalUrl, instagram: optionalUrl, youtube: optionalUrl }).partial().optional(),
  announcement: z.object({ text: z.string().max(500).optional(), link: z.string().max(500).optional(), isActive: z.boolean().optional() }).partial().optional(),
  admissionStatus: z.object({ status: z.string().max(60).optional(), message: z.string().max(500).optional() }).partial().optional(),
  seo: z.object({ defaultTitle: z.string().max(180).optional(), defaultDescription: z.string().max(320).optional(), defaultKeywords: z.array(z.string().max(80)).max(20).optional() }).optional(),
}).strict();

const idSchema = z.string().regex(/^[a-f\d]{24}$/i);

function resourceFromRequest(req: Request): ResourceName {
  const resource = req.params.resource as ResourceName;
  if (resource === 'site-settings' || resource in models) return resource;
  throw new AppError('Unknown content type', 404);
}

function parseInput(resource: ResourceName, input: unknown, partial = false) {
  const schema = resource === 'site-settings' ? settingsSchema : resourceSchemas[resource];
  const validator = partial ? schema.partial() : schema;
  const parsed = validator.safeParse(input);
  if (!parsed.success) throw new AppError('Invalid content payload', 400);
  return parsed.data;
}

export async function getDashboardSummary(_req: Request, res: Response) {
  const [enquiries, notices, events, courses] = await Promise.all([
    (await import('../models/Enquiry.js')).Enquiry.countDocuments(),
    Notice.countDocuments({ status: 'published' }),
    Event.countDocuments({ status: 'published' }),
    Course.countDocuments({ status: 'published' }),
  ]);
  res.json({ success: true, data: { enquiries, notices, events, courses } });
}

export async function listAdminContent(req: Request, res: Response) {
  const resource = resourceFromRequest(req);
  if (resource === 'site-settings') {
    const settings = await SiteSettings.findOne({}).lean();
    res.json({ success: true, data: settings });
    return;
  }

  const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit || '20'), 10) || 20));
  const filter: Record<string, unknown> = {};
  if (typeof req.query.status === 'string' && ['draft', 'published', 'archived'].includes(req.query.status)) filter.status = req.query.status;
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const escaped = req.query.q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escaped, $options: 'i' };
  }
  const model = models[resource];
  const [items, total] = await Promise.all([
    model.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    model.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function createAdminContent(req: Request, res: Response) {
  const resource = resourceFromRequest(req);
  if (resource === 'site-settings') {
    const input = parseInput(resource, req.body);
    const settings = await SiteSettings.findOneAndUpdate({}, { $set: input }, { new: true, upsert: true, runValidators: true });
    console.info('admin.content.created', { actor: req.user?.id, resource });
    res.status(201).json({ success: true, data: settings });
    return;
  }
  const input = parseInput(resource, req.body);
  const model = models[resource];
  const item = await model.create({ ...input, ...(resource === 'notices' ? { createdBy: req.user?.id } : {}), ...(resource === 'pages' ? { updatedBy: req.user?.id } : {}) });
  console.info('admin.content.created', { actor: req.user?.id, resource, itemId: String(item._id) });
  res.status(201).json({ success: true, data: item });
}

export async function updateAdminContent(req: Request, res: Response) {
  const resource = resourceFromRequest(req);
  if (!idSchema.safeParse(req.params.id).success) throw new AppError('Invalid content id', 400);
  if (resource === 'site-settings') throw new AppError('Use PUT to update site settings', 405);
  const input = parseInput(resource, req.body, true);
  const model = models[resource];
  const item = await model.findByIdAndUpdate(
    req.params.id,
    { $set: { ...input, ...(resource === 'pages' ? { updatedBy: req.user?.id } : {}) } },
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError('Content not found', 404);
  console.info('admin.content.updated', { actor: req.user?.id, resource, itemId: String(item._id) });
  res.json({ success: true, data: item });
}

export async function updateSiteSettings(req: Request, res: Response) {
  const resource = resourceFromRequest(req);
  if (resource !== 'site-settings') throw new AppError('Use PATCH to update content', 405);
  const input = parseInput(resource, req.body, true);
  const settings = await SiteSettings.findOneAndUpdate({}, { $set: input }, { new: true, upsert: true, runValidators: true });
  console.info('admin.content.updated', { actor: req.user?.id, resource });
  res.json({ success: true, data: settings });
}

export async function deleteAdminContent(req: Request, res: Response) {
  const resource = resourceFromRequest(req);
  if (resource === 'site-settings') throw new AppError('Site settings cannot be deleted', 405);
  if (!idSchema.safeParse(req.params.id).success) throw new AppError('Invalid content id', 400);
  const item = await models[resource].findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Content not found', 404);
  console.info('admin.content.deleted', { actor: req.user?.id, resource, itemId: String(item._id) });
  res.json({ success: true, message: 'Content deleted' });
}
