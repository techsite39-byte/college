import type { Request, Response } from 'express';
import { Achievement } from '../models/Achievement.js';
import { Course } from '../models/Course.js';
import { Event } from '../models/Event.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { Notice } from '../models/Notice.js';
import { PageContent } from '../models/PageContent.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AppError } from '../utils/appError.js';

function getPagination(req: Request) {
  const page = Math.max(1, Number.parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit || '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit, requested: req.query.page !== undefined || req.query.limit !== undefined };
}

function getSearchFilter(req: Request, fields: string[]) {
  if (typeof req.query.q !== 'string' || !req.query.q.trim()) return {};
  const search = req.query.q.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { $or: fields.map((field) => ({ [field]: { $regex: search, $options: 'i' } })) };
}

function responseData(items: unknown[], req: Request, paging: ReturnType<typeof getPagination>, total: number) {
  return paging.requested
    ? { items, page: paging.page, limit: paging.limit, total, pages: Math.ceil(total / paging.limit) }
    : items;
}

export async function getSiteSettings(_req: Request, res: Response) {
  const settings = await SiteSettings.findOne({}).lean();
  res.json({ success: true, data: settings || {} });
}

export async function getPages(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter = { status: 'published', ...getSearchFilter(req, ['title', 'slug']) };
  let query = PageContent.find(filter).sort({ updatedAt: -1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [pages, total] = await Promise.all([query.select('-updatedBy -__v').lean(), paging.requested ? PageContent.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(pages, req, paging, total) });
}

export async function getCourses(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter = { status: 'published', ...getSearchFilter(req, ['title', 'shortDescription', 'fullDescription']) };
  let query = Course.find(filter).sort({ createdAt: -1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [courses, total] = await Promise.all([query.select('-__v').lean(), paging.requested ? Course.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(courses, req, paging, total) });
}

export async function getNotices(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter: Record<string, unknown> = {
    status: 'published',
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };
  if (typeof req.query.category === 'string' && req.query.category.trim()) filter.category = req.query.category.trim().slice(0, 100);
  const search = getSearchFilter(req, ['title', 'content', 'category']);
  if ('$or' in search) filter.$and = [{ $or: filter.$or as unknown[] }, search];
  let query = Notice.find(filter).sort({ isPinned: -1, publishedAt: -1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [notices, total] = await Promise.all([query.select('-createdBy -__v').lean(), paging.requested ? Notice.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(notices, req, paging, total) });
}

export async function getEvents(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter = { status: 'published', ...getSearchFilter(req, ['title', 'description', 'venue']) };
  let query = Event.find(filter).sort({ startDate: 1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [events, total] = await Promise.all([query.select('-__v').lean(), paging.requested ? Event.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(events, req, paging, total) });
}

export async function getGallery(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter: Record<string, unknown> = { status: 'published', ...getSearchFilter(req, ['title', 'caption', 'category']) };
  if (typeof req.query.category === 'string' && req.query.category.trim()) filter.category = req.query.category.trim().slice(0, 100);
  let query = GalleryImage.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [gallery, total] = await Promise.all([query.select('-__v').lean(), paging.requested ? GalleryImage.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(gallery, req, paging, total) });
}

export async function getAchievements(req: Request, res: Response) {
  const paging = getPagination(req);
  const filter: Record<string, unknown> = { status: 'published', ...getSearchFilter(req, ['title', 'description', 'category']) };
  if (typeof req.query.category === 'string' && req.query.category.trim()) filter.category = req.query.category.trim().slice(0, 100);
  let query = Achievement.find(filter).sort({ achievementDate: -1 });
  if (paging.requested) query = query.skip(paging.skip).limit(paging.limit);
  const [achievements, total] = await Promise.all([query.select('-__v').lean(), paging.requested ? Achievement.countDocuments(filter) : 0]);
  res.json({ success: true, data: responseData(achievements, req, paging, total) });
}

export async function getCourse(req: Request, res: Response) {
  const course = await Course.findOne({ slug: req.params.slug, status: 'published' }).select('-__v').lean();
  if (!course) throw new AppError('Course not found', 404);
  res.json({ success: true, data: course });
}

export async function getNotice(req: Request, res: Response) {
  const notice = await Notice.findOne({
    slug: req.params.slug,
    status: 'published',
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }).select('-createdBy -__v').lean();
  if (!notice) throw new AppError('Notice not found', 404);
  res.json({ success: true, data: notice });
}

export async function getEvent(req: Request, res: Response) {
  const event = await Event.findOne({ slug: req.params.slug, status: 'published' }).select('-__v').lean();
  if (!event) throw new AppError('Event not found', 404);
  res.json({ success: true, data: event });
}
