import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/auth/login', authController.signIn);
router.post('/auth/signup', authController.signUp);
router.post('/auth/forgotPassword', authController.forgotPassword);
router.post('/auth/resetPassword', authController.resetPassword);

// Apply authentication middleware to all routes below
router.use(authMiddleware);

// Protected routes (authentication required)
router.post('/auth/logout', authController.logout);
router.delete('/delete-account', authController.deleteAccount);

export default router;
