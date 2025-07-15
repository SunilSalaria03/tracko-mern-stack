import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Auth routes (public)
router.post('/login', authController.signIn);
router.post('/signup', authController.signUp);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password-link', authController.resetPasswordLink);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authMiddleware);
// Enter protected routes here only :-
router.post('/logout', authController.logout);
router.delete('/delete-account', authController.deleteAccount);

export default router;
