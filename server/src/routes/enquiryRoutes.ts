import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createEnquiry, deleteEnquiry, listEnquiries, updateEnquiryStatus } from '../controllers/enquiryController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { requireSameOrigin } from '../middleware/sameOrigin.js';

const router = Router();
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries. Please try again later.' },
});

router.post('/', enquiryLimiter, requireSameOrigin, asyncHandler(createEnquiry));
router.get('/', requireAuth, requireRole('admin', 'superadmin'), asyncHandler(listEnquiries));
router.patch('/:id', requireAuth, requireSameOrigin, requireRole('admin', 'superadmin'), asyncHandler(updateEnquiryStatus));
router.delete('/:id', requireAuth, requireSameOrigin, requireRole('admin', 'superadmin'), asyncHandler(deleteEnquiry));

export default router;
