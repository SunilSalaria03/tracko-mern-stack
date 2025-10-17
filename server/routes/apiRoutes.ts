import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/login', authController.signIn);
router.post('/signup', authController.signUp);
// router.post('/forgot-password', authController.forgotPassword);
// router.get('/reset-password-link', authController.resetPasswordLink);
// router.post('/reset-password', authController.resetPassword);

// Apply authentication middleware to all routes below
router.use(authMiddleware);

// Protected routes (authentication required)
router.post('/logout', authController.logout);
router.delete('/delete-account', authController.deleteAccount);

export default router;
