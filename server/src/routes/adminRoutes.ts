import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import {
  createAdminContent,
  deleteAdminContent,
  getDashboardSummary,
  listAdminContent,
  updateAdminContent,
  updateSiteSettings,
} from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { requireSameOrigin } from '../middleware/sameOrigin.js';
import { AppError } from '../utils/appError.js';
import { deleteMedia, uploadMedia } from '../controllers/uploadController.js';

const router = Router();

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'];
    callback(null, allowed.includes(file.mimetype));
  },
});

const parseMediaUpload: RequestHandler = (req, res, next) => {
  mediaUpload.single('file')(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('Files must be 15 MB or smaller', 400));
      return;
    }
    next(new AppError('Only JPEG, PNG, WebP, AVIF and PDF files are allowed', 400));
  });
}

router.use(requireAuth, requireRole('admin', 'superadmin'));
router.get('/dashboard', asyncHandler(getDashboardSummary));
router.post('/uploads', requireSameOrigin, parseMediaUpload, asyncHandler(uploadMedia));
router.delete('/uploads', requireSameOrigin, asyncHandler(deleteMedia));
router.get('/:resource', asyncHandler(listAdminContent));
router.post('/:resource', requireSameOrigin, asyncHandler(createAdminContent));
router.put('/:resource', requireSameOrigin, asyncHandler(updateSiteSettings));
router.patch('/:resource/:id', requireSameOrigin, asyncHandler(updateAdminContent));
router.delete('/:resource/:id', requireSameOrigin, asyncHandler(deleteAdminContent));

export default router;
