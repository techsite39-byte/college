import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getCurrentUser, login, logout } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSameOrigin } from '../middleware/sameOrigin.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/login', authLimiter, requireSameOrigin, asyncHandler(login));
router.post('/logout', requireSameOrigin, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(getCurrentUser));

export default router;
