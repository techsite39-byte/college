import { Router } from 'express';
import {
  getAchievements,
  getCourses,
  getCourse,
  getEvents,
  getEvent,
  getGallery,
  getNotice,
  getNotices,
  getPages,
  getSiteSettings,
} from '../controllers/publicController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/site-settings', asyncHandler(getSiteSettings));
router.get('/pages', asyncHandler(getPages));
router.get('/courses', asyncHandler(getCourses));
router.get('/courses/:slug', asyncHandler(getCourse));
router.get('/notices', asyncHandler(getNotices));
router.get('/notices/:slug', asyncHandler(getNotice));
router.get('/events', asyncHandler(getEvents));
router.get('/events/:slug', asyncHandler(getEvent));
router.get('/gallery', asyncHandler(getGallery));
router.get('/achievements', asyncHandler(getAchievements));

export default router;
