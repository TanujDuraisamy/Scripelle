import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  googleSignin,
  googleCallbackHandler,
  forgotPassword,
  resetPassword,
  createAdmin,
  adminLogin,
} from '../controllers/Authentication';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import passport from '../utils/passport';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin routes
router.post('/admin/create', authenticateToken, requireAdmin, createAdmin);
router.post('/admin/login', adminLogin);

router.get(
  "/google",
  googleSignin
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallbackHandler
);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
